import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingState = ({ message = "Loading academic data...", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center gap-3 border border-slate-200/80 max-w-xs text-center">
          <Loader2 className="w-8 h-8 text-academic-700 animate-spin" />
          <p className="text-sm font-semibold text-slate-800">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
      <div className="w-12 h-12 rounded-2xl bg-academic-50 border border-academic-100 flex items-center justify-center text-academic-700">
        <Loader2 className="w-6 h-6 animate-spin stroke-[2.25]" />
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full animate-pulse space-y-2.5">
      <div className="h-10 bg-slate-100 rounded-xl w-full border border-slate-200/60"></div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-50 rounded-xl w-full flex items-center gap-4 px-4 border border-slate-100">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-3.5 bg-slate-200/80 rounded-md flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingState;
