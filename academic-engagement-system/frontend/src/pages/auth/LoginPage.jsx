import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Lock, User, GraduationCap, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, getDashboardRoute, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get("expired");

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated && role) {
      navigate(getDashboardRoute(role), { replace: true });
    }
  }, [isAuthenticated, role, navigate, getDashboardRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username/roll number and password");
      return;
    }

    setLoading(true);
    try {
      const res = await login(username.trim(), password);
      if (res.user?.role) {
        navigate(getDashboardRoute(res.user.role), { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-academic-800 text-white shadow-card mb-4 border border-academic-700">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">
            Academic Engagement System
          </h1>
          <p className="text-[15px] text-slate-500 mt-1">
            Official Institutional Management & Evaluation Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Sign in to your account</h2>
            <p className="text-[13px] sm:text-sm text-slate-500 mt-0.5">Enter your institutional credentials to continue</p>
          </div>

          {isExpired && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Your session expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Username / Roll Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. 2KCT01 or 23B21A4201"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-[15px] focus:outline-hidden focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-[15px] focus:outline-hidden focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 sm:py-3 px-4 bg-academic-800 hover:bg-academic-900 text-white rounded-xl font-semibold text-sm sm:text-[15px] transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Account Switcher Chips */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Credential Presets
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo("2KCT01", "2KCT01")}
                className="px-2.5 py-1 text-[13px] bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer font-medium"
              >
                CTPO CSM (2KCT01)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("2KCT02", "2KCT02")}
                className="px-2.5 py-1 text-[13px] bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer font-medium"
              >
                CTPO CAI (2KCT02)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("23B21A4201", "23B21A4201")}
                className="px-2.5 py-1 text-[13px] bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer font-medium"
              >
                Student (CSM)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("2KHT01", "2KHT01")}
                className="px-2.5 py-1 text-[13px] bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer font-medium"
              >
                HOD
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("admin_test", "admin123")}
                className="px-2.5 py-1 text-[13px] bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer font-medium"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[13px] text-slate-500 mt-6">
          Academic Engagement System &copy; 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
