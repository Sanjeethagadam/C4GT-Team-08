import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export const ErrorState = ({
  title = "Unable to load data",
  message = "An error occurred while retrieving information from the server.",
  onRetry = null,
}) => {
  return (
    <div className="py-10 px-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-rose-200 shadow-card my-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 border border-rose-100 shadow-xs">
        <AlertCircle className="w-6 h-6 stroke-[2]" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-academic-800 hover:bg-academic-900 text-white rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
