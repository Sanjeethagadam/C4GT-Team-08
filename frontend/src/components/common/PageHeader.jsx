import React from "react";
import { cn } from "@/utils";

export const PageHeader = ({ title, description, action, className }) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pt-2",
        className,
      )}
    >
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#7C3AED] to-[#A78BFA] shrink-0" />
          <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-sm text-[#6B7280] ml-4">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 ml-4 sm:ml-0">{action}</div>}
    </div>
  );
};
