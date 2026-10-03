import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/utils";

const riskConfig = {
  high: {
    icon: ShieldAlert,
    label: "High Risk",
    classes: "bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-200",
  },
  medium: {
    icon: Shield,
    label: "Medium Risk",
    classes: "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200",
  },
  low: {
    icon: ShieldCheck,
    label: "Low Risk",
    classes: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200",
  },
};

export const RiskBadge = ({ level, className }) => {
  const normalizedLevel = (level || "low").toLowerCase();
  const config = riskConfig[normalizedLevel] || riskConfig.low;
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
      {config.label}
    </Badge>
  );
};
