import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/utils";

export const ChartCard = ({ title, description, children, className, action }) => {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white border border-[#E9D5FF]",
        "shadow-[0_1px_3px_rgba(124,58,237,0.04)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.10)]",
        "transition-all duration-200 flex flex-col group",
        className,
      )}
    >
      <CardHeader className="px-6 py-4 bg-gradient-to-r from-[#F5F3FF] via-[#FAF8FF] to-white border-b border-[#E9D5FF]/70 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-bold text-[#0F172A] tracking-tight">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs font-medium text-[#6B7280] mt-0.5">
              {description}
            </CardDescription>
          )}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] p-6">{children}</CardContent>
    </Card>
  );
};
