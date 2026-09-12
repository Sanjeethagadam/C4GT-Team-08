import React from "react";
import { FolderOpen } from "lucide-react";

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No records found",
  description = "There is currently no data available from the academic database.",
  action = null,
}) => {
  return (
    <div className="py-14 px-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200/80 shadow-card my-4">
      <div className="w-14 h-14 rounded-2xl bg-academic-50/80 flex items-center justify-center text-academic-600 mb-4 border border-academic-100/80 shadow-inner">
        <Icon className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
