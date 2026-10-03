import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    try {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.role) {
          window.location.href = `/${parsed.role.toLowerCase()}/dashboard`;
          return;
        }
      }
    } catch (e) {
      console.error("Failed to parse user for return home:", e);
    }
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-xs rounded-2xl border border-rose-200 shadow-sm text-center my-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-2xs">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Dashboard View Encountered an Error
          </h2>
          <p className="text-xs text-slate-500 max-w-md mt-1 mb-4 leading-relaxed">
            {this.state.error?.message ||
              "An unexpected error occurred while rendering this dashboard view."}
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReload}
              className="gap-2 rounded-xl text-xs font-semibold text-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload View
            </Button>
            <Button
              size="sm"
              onClick={this.handleGoHome}
              className="gap-2 rounded-xl text-xs font-semibold bg-[#052659] text-white hover:bg-[#021024]"
            >
              <Home className="w-3.5 h-3.5" />
              Return Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
