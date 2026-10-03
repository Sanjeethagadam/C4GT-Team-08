import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/utils";

export const ChartCard = ({ title, description, children, className, action }) => {
  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-white via-[#fcfdff] to-[#f3f8fd] border border-[#7DA0CA]/40 shadow-xs hover:border-[#5483B3]/50 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden flex flex-col relative group",
        className
      )}
    >
      {/* Subtle translucent bubble shapes behind content */}
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#C1E8FF]/20 blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-[#7DA0CA]/10 blur-lg pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between pb-3.5 pt-4 px-5 border-b border-[#7DA0CA]/25 bg-gradient-to-r from-[#052659]/5 via-[#5483B3]/5 to-transparent relative z-10">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 rounded-full bg-[#052659] shrink-0" />
            <CardTitle className="text-sm font-extrabold text-[#021024] tracking-tight">
              {title}
            </CardTitle>
          </div>
          {description && (
            <CardDescription className="text-xs text-[#5483B3] font-medium pl-3.5">
              {description}
            </CardDescription>
          )}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <div className="p-5 flex-1 min-h-[260px] relative z-10">
        <div className="w-full h-full">{children}</div>
      </div>
    </Card>
  );
};
