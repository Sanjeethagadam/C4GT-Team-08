import React from "react";

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "academic",
  color = "academic",
  action,
}) => {
  const variantStyles = {
    academic: { 
      iconBg: "bg-academic-50 text-academic-700 border-academic-200/80", 
      accentBar: "bg-academic-600" 
    },
    brand: { 
      iconBg: "bg-brand-50 text-brand-700 border-brand-200/80", 
      accentBar: "bg-brand-600" 
    },
    sky: { 
      iconBg: "bg-sky-50 text-sky-700 border-sky-200/80", 
      accentBar: "bg-sky-500" 
    },
    emerald: { 
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80", 
      accentBar: "bg-emerald-500" 
    },
    amber: { 
      iconBg: "bg-amber-50 text-amber-700 border-amber-200/80", 
      accentBar: "bg-amber-500" 
    },
    rose: { 
      iconBg: "bg-rose-50 text-rose-700 border-rose-200/80", 
      accentBar: "bg-rose-500" 
    },
    purple: { 
      iconBg: "bg-purple-50 text-purple-700 border-purple-200/80", 
      accentBar: "bg-purple-500" 
    },
    indigo: { 
      iconBg: "bg-indigo-50 text-indigo-700 border-indigo-200/80", 
      accentBar: "bg-indigo-500" 
    },
  };

  const style = variantStyles[color] || variantStyles[variant] || variantStyles.academic;

  const displayValue = value === null || value === undefined || value === "" ? "No data available" : value;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs sm:text-[13px] font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
            {displayValue}
          </div>
          {subtitle && (
            <p className="text-[13px] sm:text-sm text-slate-500 line-clamp-1 font-normal">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${style.iconBg} transition-transform duration-200 group-hover:scale-105`}>
            <Icon className="w-5 h-5 stroke-[1.75]" />
          </div>
        )}
      </div>
      {action && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[13px] sm:text-sm font-semibold">
          {action}
        </div>
      )}
    </div>
  );
};

export default StatCard;
