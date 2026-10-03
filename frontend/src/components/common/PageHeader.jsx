import React from "react";
import { cn } from "@/utils";

export const PageHeader = ({ title, description, action, className }) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1",
        className,
      )}
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#021024]">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-[#5483B3] font-medium mt-0.5">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
};
