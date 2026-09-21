import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";

export const Login = () => {
  // View State
  const [view, setView] = useState("login");

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Registration state
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
      // Navigation is now handled by the useEffect above
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (regPassword !== confirmPassword) {
      setError("Passwords do not match.");
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
        "Account created successfully. Your account is pending administrator approval. Please sign in once approved.",
      );
      setView("login");
      // Clear forms
      setFullName("");
      setEmail("");
      setRegUsername("");
      setRegPassword("");
      setConfirmPassword("");
      setPhoneNumber("");
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(
      "Password reset functionality is currently managed by the administrator. Please contact your admin to reset your password.",
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3FF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-[#EDE9FE] rounded-2xl mb-4 text-[#7C3AED] ring-1 ring-[#DDD6FE] shadow-xs">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1F1B2D] mb-1">
            SAMS Portal
          </h2>
          <p className="text-sm font-medium text-[#6B6480]">
            Student Academic Management System
          </p>
        </div>

        <Card className="shadow-xl shadow-[#7C3AED]/5 border border-[#E5E0F5] bg-white rounded-2xl">
          <CardHeader className="space-y-1 pb-6 pt-8 px-8">
            <CardTitle className="text-xl text-center text-[#1F1B2D] font-bold">
              {view === "register"
                ? "Create Your Account"
                : view === "forgot_password"
                  ? "Forgot Password"
                  : "Sign in to your account"}
            </CardTitle>
            <CardDescription className="text-center font-medium text-[#6B6480]">
              {view === "register"
                ? "Fill in the details below to register"
                : view === "forgot_password"
                  ? "Enter your email or username to reset"
                  : "Enter your credentials to access your dashboard"}
            </CardDescription>
          </CardHeader>
          <form
            onSubmit={
              view === "register"
                ? handleRegister
                : view === "forgot_password"
                  ? handleForgotPassword
                  : handleLogin
            }
          >
            <CardContent className="space-y-5 px-8">
              {error && (
                <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg border border-rose-100 flex items-start gap-2 font-medium">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}
              {successMessage && (
                <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-lg border border-emerald-100 flex items-start gap-2 font-medium">
                  <span className="font-bold">Success:</span> {successMessage}
                </div>
              )}

              {view === "register" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="e.g. John Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                      className="rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address{" "}
                      <span className="text-slate-400 text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regUsername">
                      Username / ID <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="regUsername"
                      type="text"
                      placeholder="Choose a username"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      disabled={isLoading}
                      className="rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regPassword">
                      Password <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="regPassword"
                        type={showRegPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        disabled={isLoading}
                        className="pr-10 rounded-lg h-11"
                      />

                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        aria-label={
                          showRegPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showRegPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        className="pr-10 rounded-lg h-11"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      Phone Number{" "}
                      <span className="text-slate-400 text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isLoading}
                      className="rounded-lg h-11"
                    />
                  </div>
                </>
              ) : view === "forgot_password" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="resetIdentifier">Email or Username</Label>
                    <Input
                      id="resetIdentifier"
                      type="text"
                      placeholder="Enter your email or username"
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      disabled={isLoading}
                      className="rounded-lg h-11"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username / ID</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      autoComplete="username"
                      className="rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={() => {
                          setView("forgot_password");
                          setError(null);
                          setSuccessMessage(null);
                        }}
                        className="text-sm text-[#7C3AED] hover:text-[#6D28D9] hover:underline font-semibold"
                        tabIndex={-1}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        autoComplete="current-password"
                        className="pr-10 rounded-lg h-11"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 px-8 pb-8">
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md shadow-[#7C3AED]/20 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {view === "register"
                      ? "Registering..."
                      : view === "forgot_password"
                        ? "Processing..."
                        : "Signing in..."}
                  </>
                ) : view === "register" ? (
                  "Register"
                ) : view === "forgot_password" ? (
                  "Reset Password"
                ) : (
                  "Sign in"
                )}
              </Button>
              <div className="text-sm text-center text-slate-500">
                {view === "register" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setView("login");
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[#7C3AED] hover:text-[#6D28D9] hover:underline font-semibold"
                    >
                      Sign in
                    </button>
                  </>
                ) : view === "forgot_password" ? (
                  <>
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setView("login");
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[#7C3AED] hover:text-[#6D28D9] hover:underline font-semibold"
                    >
                      Back to Login
                    </button>
                  </>
                ) : (
                  <>
                    New user?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setView("register");
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[#7C3AED] hover:text-[#6D28D9] hover:underline font-semibold"
                    >
                      Register here
                    </button>
                  </>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-8">
          &copy; {new Date().getFullYear()} KIET Group of Institutions. All
          rights reserved.
        </p>
      </div>
    </div>
  );
};
