import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Loader2,
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/providers/AuthProvider";

import campusBg from "@/assets/kiet-login-final.jpg";

export const Login = () => {
  // View State: "login" | "register" | "forgot_password"
  const [view, setView] = useState("login");

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Registration form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password state
  const [resetIdentifier, setResetIdentifier] = useState("");

  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user: authUser } = useAuth();
  const navigate = useNavigate();

  // Redirect automatically when authenticated
  useEffect(() => {
    if (isAuthenticated && authUser) {
      navigate(`/${authUser.role.toLowerCase()}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, authUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await login({ username, password });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your username and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (regPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    try {
      const baseURL = (
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
      ).replace("/v1", "");
      const response = await fetch(`${baseURL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          username: regUsername,
          password: regPassword,
          phoneNumber,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      setSuccessMessage(
        "Account created successfully! It is pending administrator verification. Please sign in once approved.",
      );
      setView("login");
      setFullName("");
      setEmail("");
      setRegUsername("");
      setRegPassword("");
      setConfirmPassword("");
      setPhoneNumber("");
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(
      "Password reset requests are processed by the System Administrator. Please contact your campus coordinator or department admin.",
    );
  };

    const renderForm = () => (
    <div className="w-full max-w-[440px] mx-auto flex flex-col bg-white">
      <div className="text-center" style={{ marginBottom: '36px' }}>
        <div className="inline-flex h-[80px] w-[80px] mx-auto rounded-3xl bg-[#052659] text-white items-center justify-center shadow-sm mb-5">
          <GraduationCap className="h-10 w-10 text-[#C1E8FF]" />
        </div>
        
        {view === "login" && (
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#021024] mb-4">
            Welcome back!
          </h1>
        )}

        {view === "forgot_password" && (
          <h1 className="text-3xl font-extrabold text-[#021024] mb-3">
            Account Recovery
          </h1>
        )}
        
        {view === "login" ? (
          <div className="flex items-center justify-center gap-3 w-full">
            <div className="h-[1px] w-10 bg-[#395B82]/30"></div>
            <p className="text-base md:text-lg text-[#395B82] font-extrabold">
              Sign in with your institutional credentials
            </p>
            <div className="h-[1px] w-10 bg-[#395B82]/30"></div>
          </div>
        ) : (
          <p className="text-sm text-[#395B82] font-semibold mt-1">
            Enter your credentials to initiate a reset inquiry
          </p>
        )}
      </div>

      <form
        autoComplete="off"
        onSubmit={
          view === "forgot_password"
            ? handleForgotPassword
            : handleLogin
        }
        className="flex flex-col w-full"
      >
        <div className="flex flex-col">
          {/* Status Messages */}
          {error && (
            <Alert variant="destructive" className="py-2.5 px-3 rounded-lg text-xs mb-6">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 flex items-start gap-2 font-medium mb-6">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {view === "login" && (
            <>
              <div className="flex flex-col" style={{ marginBottom: '22px' }}>
                <Label htmlFor="username" className="text-xs font-bold text-[#021024] mb-2">
                  Username or Roll Number
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5483B3] pointer-events-none" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. 23B21A4201 or admin"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                    className="pl-11 h-14 text-sm bg-white border-[#7DA0CA]/40 rounded-xl focus-visible:ring-[#052659]"
                  />
                </div>
              </div>

              <div className="flex flex-col" style={{ marginBottom: '16px' }}>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="text-xs font-bold text-[#021024]">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot_password");
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[12px] text-[#052659] hover:text-[#5483B3] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5483B3] pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="pl-11 pr-11 h-14 text-sm bg-white border-[#7DA0CA]/40 rounded-xl focus-visible:ring-[#052659]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5483B3] hover:text-[#021024] p-0.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between" style={{ marginBottom: '30px' }}>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-xs text-[#5483B3] font-medium cursor-pointer"
                  >
                    Remember this device
                  </Label>
                </div>
              </div>
            </>
          )}



          {/* FORGOT PASSWORD VIEW */}
          {view === "forgot_password" && (
            <div className="space-y-1.5 mb-8">
              <Label htmlFor="resetIdentifier" className="text-xs font-bold text-[#021024]">
                Registered Email or Roll Number
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5483B3] pointer-events-none" />
                <Input
                  id="resetIdentifier"
                  type="text"
                  placeholder="Enter your email or roll number"
                  required
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-14 text-sm bg-white border-[#7DA0CA]/40 rounded-xl focus-visible:ring-[#052659]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col w-full">
          <Button
            type="submit"
            disabled={isLoading}
            style={{ marginBottom: '24px' }}
            className="w-full h-[60px] text-[15px] font-bold rounded-xl bg-[#052659] hover:bg-[#021024] text-white shadow-md transition-all hover:shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Authenticating...
              </span>
            ) : view === "forgot_password" ? (
              "Request Password Help"
            ) : (
              "Sign In to AMS"
            )}
          </Button>

          {/* Mode Switching Links */}
          <div className="text-center text-[13px] text-[#5483B3]">
            {view === "login" ? (
              <span>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("register");
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#052659] font-bold hover:underline"
                >
                  Create account
                </button>
              </span>
            ) : view === "forgot_password" ? (
              <span>
                Back to{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#052659] font-bold hover:underline"
                >
                  Login
                </button>
              </span>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );

  if (view === "register") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[#F3F8FD] overflow-y-auto relative overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="fixed top-[-15%] left-[-10%] w-[50%] max-w-[600px] aspect-square rounded-full bg-[#E0F0FE] opacity-40 blur-[80px] pointer-events-none" />
        <div className="fixed bottom-[-15%] right-[-10%] w-[50%] max-w-[600px] aspect-square rounded-full bg-[#E0F0FE] opacity-40 blur-[80px] pointer-events-none" />
        <div className="fixed top-[20%] right-[-5%] w-[30%] max-w-[400px] aspect-square rounded-full bg-[#E8F4FE] opacity-30 blur-[60px] pointer-events-none" />
        
        {/* Subtle decorative background text - Left */}
        <div className="hidden lg:flex fixed left-[2%] xl:left-[8%] top-1/2 -translate-y-1/2 flex-col gap-1 z-0 pointer-events-none opacity-[0.35]">
          <span className="text-[#5483B3] text-lg xl:text-[22px] leading-snug font-light tracking-wide">Empowering</span>
          <span className="text-[#5483B3] text-lg xl:text-[22px] leading-snug font-light tracking-wide">Students</span>
          <span className="text-[#5483B3] text-lg xl:text-[22px] leading-snug font-light tracking-wide">Building Futures</span>
          <div className="w-10 h-[1.5px] bg-[#5483B3]/40 mt-3" />
        </div>

        {/* Subtle decorative background text - Right */}
        <div className="hidden lg:flex fixed right-[2%] xl:right-[8%] top-1/2 -translate-y-1/2 flex-col gap-1 z-0 pointer-events-none opacity-[0.35] items-start text-left">
          <span className="text-[#5483B3] text-lg xl:text-[22px] leading-snug font-light tracking-wide">Education</span>
          <span className="text-[#5483B3] text-lg xl:text-[22px] leading-snug font-light tracking-wide">Today</span>
          <span className="text-[#5483B3] text-lg xl:text-[22px] leading-snug font-light tracking-wide">A Better Tomorrow</span>
          <div className="w-10 h-[1.5px] bg-[#5483B3]/40 mt-3" />
        </div>
        
        <div className="w-full max-w-[700px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E2E8F0]/60 p-8 md:p-10 lg:p-12 my-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 mx-auto rounded-2xl bg-[#052659] text-white items-center justify-center shadow-sm mb-6">
              <GraduationCap className="h-8 w-8 text-[#C1E8FF]" />
            </div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-[#021024]">
              Create Academic Account
            </h1>
            <p className="text-[14px] md:text-[16px] text-[#5483B3] font-medium mt-2">
              Submit your registration for administrative verification
            </p>
          </div>
          
          <div className="w-full max-w-[520px] mx-auto">
            <form
              autoComplete="off"
              onSubmit={handleRegister}
              className="flex flex-col w-full"
            >
              <div className="flex flex-col">
                {/* Status Messages */}
                {error && (
                  <Alert variant="destructive" className="py-2.5 px-3 rounded-lg text-xs mb-6">
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 flex items-start gap-2 font-medium mb-6">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* FIELDS */}
                <div className="space-y-2 mb-6 mt-2">
                  <Label htmlFor="fullName" className="text-xs font-bold text-[#021024]">
                    Full Name <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5483B3] pointer-events-none" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="e.g. John Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                      autoComplete="off"
                      className="pl-10 h-[52px] text-sm bg-white border-[#7DA0CA]/40 rounded-xl focus-visible:ring-[#052659] placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <Label htmlFor="email" className="text-xs font-bold text-[#021024]">
                    Email Address <span className="text-[#7DA0CA] font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5483B3] pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="username@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="off"
                      className="pl-10 h-[52px] text-sm bg-white border-[#7DA0CA]/40 rounded-xl focus-visible:ring-[#052659] placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <Label htmlFor="regUsername" className="text-xs font-bold text-[#021024]">
                    Desired Username / Roll No <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5483B3] pointer-events-none" />
                    <Input
                      id="regUsername"
                      type="text"
                      placeholder="Enter username or roll number"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      disabled={isLoading}
                      autoComplete="off"
                      className="pl-10 h-[52px] text-sm bg-white border-[#7DA0CA]/40 rounded-xl focus-visible:ring-[#052659] placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <Label htmlFor="regPassword" className="text-xs font-bold text-[#021024]">
                    Password <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5483B3] pointer-events-none" />
                    <Input
                      id="regPassword"
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="pl-10 pr-10 h-[52px] text-sm bg-white border-[#7DA0CA]/40 rounded-xl focus-visible:ring-[#052659] placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5483B3] hover:text-[#021024] p-0.5"
                      aria-label={showRegPassword ? "Hide password" : "Show password"}
                    >
                      {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold text-[#021024]">
                    Confirm Password <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5483B3] pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="pl-10 pr-10 h-[52px] text-sm bg-white border-[#7DA0CA]/40 rounded-xl focus-visible:ring-[#052659] placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5483B3] hover:text-[#021024] p-0.5"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <Label htmlFor="phoneNumber" className="text-xs font-bold text-[#021024]">
                    Phone Number <span className="text-[#7DA0CA] font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5483B3] pointer-events-none" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isLoading}
                      autoComplete="off"
                      className="pl-10 h-[52px] text-sm bg-white border-[#7DA0CA]/40 rounded-xl focus-visible:ring-[#052659] placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full">
                <Button
                  type="submit"
                  disabled={isLoading}
                  style={{ marginBottom: '20px' }}
                  className="w-full h-[52px] md:h-[56px] text-[15px] font-bold rounded-xl bg-[#052659] hover:bg-[#021024] text-white shadow-md transition-all hover:shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>

                <div className="text-center text-[13px] text-[#5483B3]">
                  <span>
                    <button
                      type="button"
                      onClick={() => {
                        setView("login");
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[#5483B3] hover:text-[#052659] font-medium hover:underline transition-colors"
                    >
                      Back to Login
                    </button>
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#f8fafc]">
      
      {/* 
        MAIN AUTHENTICATION SHELL
        Matches the second reference: ~1250px wide, 52/48 split, ~680px high
        If view is register, it allows the height to expand naturally to prevent clipping.
      */}
      <div className="w-full max-w-[1250px] bg-white rounded-[24px] md:rounded-[32px] shadow-[0_20px_60px_-15px_rgba(2,16,36,0.15)] overflow-hidden flex flex-col md:flex-row min-h-[680px] h-auto md:h-[680px]">
        
        {/* 
          LEFT SECTION - KIET VISUAL
          Exactly 50% width on desktop.
          Using object-[left_center] dynamically crops out the baked-in form from the source image,
          leaving the KIET branding perfectly framed.
        */}
        <div className="w-full md:w-[52%] aspect-[4/3] md:aspect-auto md:h-full relative shrink-0 overflow-hidden">
        <img 
          src={campusBg} 
          alt="KIET Academic Management System" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </div>

        {/* 
          RIGHT SECTION - SAMS LOGIN
          Exactly 50% width on desktop.
          Flat white background (no nested cards).
        */}
        <div className="w-full md:w-[48%] flex flex-col justify-center bg-white p-6 md:p-10 lg:p-16">
          {renderForm()}
        </div>

      </div>
    </div>
  );
};
