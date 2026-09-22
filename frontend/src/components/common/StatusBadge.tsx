import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, Info } from 'lucide-react';
import { cn } from '@/utils';

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    classes: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
  },
  warning: {
    icon: Clock,
    classes: 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200'
  },
  danger: {
    icon: XCircle,
    classes: 'bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200'
  },
  info: {
    icon: Info,
    classes: 'bg-sky-100 text-sky-800 hover:bg-sky-100 border-sky-200'
  },
  neutral: {
    icon: Info,
    classes: 'bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-md font-medium flex items-center gap-1.5", config.classes, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
};
