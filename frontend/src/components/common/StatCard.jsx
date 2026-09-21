import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils";

const PALETTES = {
  purple: {
    cardBg: "bg-[#F5F3FF]",
    border: "border-[#E9D5FF]",
    iconBg: "bg-[#EDE9FE]",
    iconColor: "text-[#7C3AED]",
    badgeBg: "bg-white/80 text-[#7C3AED] border-[#E9D5FF]",
    dotColor: "bg-[#7C3AED]",
  },
  sky: {
    cardBg: "bg-[#F0F9FF]",
    border: "border-[#BAE6FD]",
    iconBg: "bg-[#E0F2FE]",
    iconColor: "text-[#0284C7]",
    badgeBg: "bg-white/80 text-[#0284C7] border-[#BAE6FD]",
    dotColor: "bg-[#0284C7]",
  },
  mint: {
    cardBg: "bg-[#ECFDF5]",
    border: "border-[#A7F3D0]",
    iconBg: "bg-[#D1FAE5]",
    iconColor: "text-[#059669]",
    badgeBg: "bg-white/80 text-[#059669] border-[#A7F3D0]",
    dotColor: "bg-[#059669]",
  },
  amber: {
    cardBg: "bg-[#FFFBEB]",
    border: "border-[#FDE68A]",
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]",
    badgeBg: "bg-white/80 text-[#D97706] border-[#FDE68A]",
    dotColor: "bg-[#D97706]",
  },
  rose: {
    cardBg: "bg-[#FFF1F2]",
    border: "border-[#FECDD3]",
    iconBg: "bg-[#FFE4E6]",
    iconColor: "text-[#E11D48]",
    badgeBg: "bg-white/80 text-[#E11D48] border-[#FECDD3]",
    dotColor: "bg-[#E11D48]",
  },
  cyan: {
    cardBg: "bg-[#ECFEFF]",
    border: "border-[#A5F3FC]",
    iconBg: "bg-[#CFFAFE]",
    iconColor: "text-[#0891B2]",
    badgeBg: "bg-white/80 text-[#0891B2] border-[#A5F3FC]",
    dotColor: "bg-[#0891B2]",
  },
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  contextLine,
  contextType = "neutral",
  colorVariant,
  className,
  ...props
}) => {
  const resolvedVariant =
    colorVariant ||
    (contextType === "danger"
      ? "rose"
      : contextType === "warning"
        ? "amber"
        : contextType === "success"
          ? "mint"
          : contextType === "info"
            ? "sky"
            : "purple");

  const palette = PALETTES[resolvedVariant] || PALETTES.purple;

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5",
        "shadow-[0_1px_3px_rgba(124,58,237,0.04)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.10)]",
        "hover:-translate-y-0.5 transition-all duration-200",
        palette.cardBg,
        palette.border,
        className,
      )}
      {...props}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
          {title}
        </p>
        {Icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0",
              palette.iconBg,
            )}
          >
            <Icon className={cn("w-5 h-5", palette.iconColor)} />
          </div>
        )}
      </div>

      {/* Value */}
      <p className="mt-3 text-3xl font-bold text-[#0F172A] tabular-nums tracking-tight">
        {value}
      </p>

      {/* Optional sub-line / context */}
      {contextLine && (
        <div className="mt-2.5 flex items-center">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
              palette.badgeBg,
            )}
          >
            <span
              className={cn("w-1.5 h-1.5 rounded-full shrink-0", palette.dotColor)}
            />
            {contextLine}
          </span>
        </div>
      )}
    </Card>
  );
};
