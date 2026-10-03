import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Info } from "lucide-react";
import { cn } from "@/utils";

const statusConfig = {
  success: {
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200",
  },
  warning: {
    icon: Clock,
    classes: "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200",
  },
  danger: {
    icon: XCircle,
    classes: "bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-200",
  },
  info: {
    icon: Info,
    classes: "bg-[#C1E8FF]/40 text-[#052659] hover:bg-[#C1E8FF]/40 border-[#7DA0CA]/40",
  },
  neutral: {
    icon: Info,
    classes: "bg-[#f4f9fd] text-[#5483B3] hover:bg-[#f4f9fd] border-[#7DA0CA]/30",
  },
};

export const StatusBadge = ({ status = "neutral", label, className }) => {
  const normalizedStatus = (status || "neutral").toLowerCase();
  const config = statusConfig[normalizedStatus] || statusConfig.neutral;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2 py-0.5 rounded-md font-semibold text-[11px] inline-flex items-center gap-1 shadow-2xs",
        config.classes,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label || status}
    </Badge>
  );
};
