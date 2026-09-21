import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';

export const Login = () => {
  const [view, setView] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user: authUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && authUser) {
      navigate(`/${authUser.role.toLowerCase()}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, authUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    
    try {
      await login({ username, password });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (regPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/v1', '');
      const response = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, username: regUsername, password: regPassword, phoneNumber }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      
      setSuccessMessage('Account created successfully. Pending administrator approval.');
      setView('login');
      setFullName(''); setEmail(''); setRegUsername(''); setRegPassword(''); setConfirmPassword(''); setPhoneNumber('');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("Password reset is managed by the administrator. Please contact admin.");
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      
      {/* Background Campus Image */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-900">
        <img 
          src="/campus.jpg" 
          alt="KIET Campus Background" 
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      </div>

      {/* Top Header Section: Logo & Tagline */}
      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between z-10 gap-4">
        
        {/* KIET Logo Card - Highlighted with ring/glow */}
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-indigo-500/40 ring-4 ring-indigo-500/10">
          <img 
            src="/logo.jpg" 
            alt="KIET Group of Institutions Logo" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
          />
          <div className="block border-l border-slate-200 pl-3">
            <h1 className="text-xs sm:text-sm font-extrabold text-[#0b2545] tracking-tight leading-tight">
              KIET <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 block sm:inline">GROUP OF INSTITUTIONS</span>
            </h1>
            <p className="text-[8px] sm:text-[9px] text-slate-500 font-semibold tracking-wide">
              Approved by AICTE, Govt. of A.P. & Affiliated to JNTUK
            </p>
          </div>
        </div>

        {/* Tagline on Top Right */}
        <div className="italic font-serif text-white text-xl sm:text-2xl tracking-wide font-medium self-end sm:self-center pr-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          "Where Ideas Build Tomorrow"
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="w-full max-w-7xl mx-auto flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 my-auto py-6">
        
        {/* Left Column: Portal Sign In Card - Highlighted with prominent ring/border */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:mx-0">
          <Card className="shadow-2xl border-2 border-indigo-500/55 bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden ring-8 ring-indigo-500/10">
            <CardHeader className="space-y-1 pb-3 pt-6 px-6 sm:px-8 text-left border-b border-slate-100">
              <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {view === 'register' ? 'Create Your Account' : view === 'forgot_password' ? 'Forgot Password' : 'Portal Sign In'}
              </CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500">
                {view === 'register' 
                  ? 'Fill in the details below to register for the portal' 
                  : view === 'forgot_password'
                  ? 'Enter your email or username to request reset'
                  : 'Enter your credentials to access your dashboard'}
              </CardDescription>
            </CardHeader>

            <form onSubmit={view === 'register' ? handleRegister : view === 'forgot_password' ? handleForgotPassword : handleLogin}>
              <CardContent className="space-y-3.5 px-6 sm:px-8 pt-4">
                {error && (
                  <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-xl border border-rose-100 flex items-start gap-2 font-medium">
                    <span className="font-bold">Error:</span> {error}
                  </div>
                )}
                {successMessage && (
                  <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-xl border border-emerald-100 flex items-start gap-2 font-medium">
                    <span className="font-bold">Success:</span> {successMessage}
                  </div>
                )}
                
                {view === 'register' ? (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-xs">Full Name <span className="text-rose-500">*</span></Label>
                      <Input id="fullName" type="text" placeholder="e.g. John Doe" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} className="rounded-xl h-10 text-sm bg-slate-50/50" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs">Email Address <span className="text-slate-400 text-[10px]">(Optional)</span></Label>
                      <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="rounded-xl h-10 text-sm bg-slate-50/50" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="regUsername" className="text-xs">Username / ID <span className="text-rose-500">*</span></Label>
                      <Input id="regUsername" type="text" placeholder="Choose a username" required value={regUsername} onChange={(e) => setRegUsername(e.target.value)} disabled={isLoading} className="rounded-xl h-10 text-sm bg-slate-50/50" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="regPassword" className="text-xs">Password <span className="text-rose-500">*</span></Label>
                      <div className="relative">
                        <Input id="regPassword" type={showRegPassword ? "text" : "password"} required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} disabled={isLoading} className="pr-10 rounded-xl h-10 text-sm bg-slate-50/50" />
                        <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirmPassword" className="text-xs">Confirm Password <span className="text-rose-500">*</span></Label>
                      <div className="relative">
                        <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className="pr-10 rounded-xl h-10 text-sm bg-slate-50/50" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phoneNumber" className="text-xs">Phone Number <span className="text-slate-400 text-[10px]">(Optional)</span></Label>
                      <Input id="phoneNumber" type="tel" placeholder="+91 98765 43210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={isLoading} className="rounded-xl h-10 text-sm bg-slate-50/50" />
                    </div>
                  </>
                ) : view === 'forgot_password' ? (
                  <div className="space-y-1">
                    <Label htmlFor="resetIdentifier" className="text-xs">Email or Username</Label>
                    <Input id="resetIdentifier" type="text" placeholder="Enter your email or username" required value={resetIdentifier} onChange={(e) => setResetIdentifier(e.target.value)} disabled={isLoading} className="rounded-xl h-10 text-sm bg-slate-50/50" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="text-slate-700 font-semibold text-[11px] uppercase tracking-wider">Username / ID</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <User className="h-4 w-4" />
                        </span>
                        <Input id="username" type="text" placeholder="e.g. admin, hod_year2, or roll number" required value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} autoComplete="username" className="pl-10 rounded-xl h-11 text-sm bg-slate-50/60 border-slate-200 focus:bg-white" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-slate-700 font-semibold text-[11px] uppercase tracking-wider">Password</Label>
                        <button type="button" onClick={() => { setView('forgot_password'); setError(null); setSuccessMessage(null); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors" tabIndex={-1}>
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Lock className="h-4 w-4" />
                        </span>
                        <Input id="password" type={showPassword ? "text" : "password"} required placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} autoComplete="current-password" className="pl-10 pr-10 rounded-xl h-11 text-sm bg-slate-50/60 border-slate-200 focus:bg-white" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3 px-6 sm:px-8 pb-6 pt-2">
                <Button type="submit" className="w-full h-11 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-[#5c54ed] via-[#6366f1] to-[#f472b6] hover:opacity-95 text-white shadow-md shadow-indigo-500/20 transition-all" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {view === 'register' ? 'Registering...' : view === 'forgot_password' ? 'Processing...' : 'Signing in...'}
                    </>
                  ) : (
                    view === 'register' ? 'Register Account' : view === 'forgot_password' ? 'Reset Password' : '→ Sign In to Portal'
                  )}
                </Button>

                <div className="text-xs sm:text-sm text-center text-slate-500 pt-1 font-medium">
                  {view === 'register' ? (
                    <>
                      Already have an account?{' '}
                      <button type="button" onClick={() => { setView('login'); setError(null); setSuccessMessage(null); }} className="text-indigo-600 hover:text-indigo-800 font-bold underline">
                        Sign in
                      </button>
                    </>
                  ) : view === 'forgot_password' ? (
                    <>
                      Remember your password?{' '}
                      <button type="button" onClick={() => { setView('login'); setError(null); setSuccessMessage(null); }} className="text-indigo-600 hover:text-indigo-800 font-bold underline">
                        Back to Login
                      </button>
                    </>
                  ) : (
                    <>
                      New faculty or student?{' '}
                      <button type="button" onClick={() => { setView('register'); setError(null); setSuccessMessage(null); }} className="text-indigo-600 hover:text-indigo-800 font-bold underline">
                        Register here
                      </button>
                    </>
                  )}
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="hidden lg:block lg:col-span-7 pointer-events-none" />

      </div>

      <div className="w-full h-4 z-10" />

    </div>
  );
};