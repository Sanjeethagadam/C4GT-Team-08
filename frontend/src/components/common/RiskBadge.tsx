import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Shield, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils';

export type RiskLevel = 'high' | 'medium' | 'low';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const riskConfig = {
  high: {
    icon: ShieldAlert,
    label: 'High Risk',
    classes: 'bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200'
  },
  medium: {
    icon: Shield,
    label: 'Medium Risk',
    classes: 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200'
  },
  low: {
    icon: ShieldCheck,
    label: 'Low Risk',
    classes: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
  }
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className }) => {
  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-md font-medium flex items-center gap-1.5", config.classes, className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};
