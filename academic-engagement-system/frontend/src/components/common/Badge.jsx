import React from "react";

export const Badge = ({ children, variant = "default", size = "md", className = "" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200/80",
    neutral: "bg-slate-100 text-slate-700 border-slate-200/80",
    brand: "bg-academic-50 text-academic-700 border-academic-200/80",
    academic: "bg-academic-50 text-academic-700 border-academic-200/80",
    primary: "bg-academic-50 text-academic-700 border-academic-200/80",
    info: "bg-sky-50 text-sky-700 border-sky-200/80",
    sky: "bg-sky-50 text-sky-700 border-sky-200/80",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80",
    purple: "bg-purple-50 text-purple-700 border-purple-200/80",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs font-semibold",
    md: "px-3 py-1 text-[13px] sm:text-sm font-semibold",
    lg: "px-3.5 py-1.5 text-sm sm:text-[15px] font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
