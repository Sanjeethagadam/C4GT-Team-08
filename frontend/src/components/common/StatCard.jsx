import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils";

// 1. Precise Academic Sketches matching Reference Image media_1789879005640.png
const ShieldRiskSketch = ({ className = "text-rose-500" }) => (
  <svg
    viewBox="0 0 110 90"
    className={cn("w-28 h-24 overflow-visible", className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      d="M55 10 L84 22 V48 C84 68 55 82 55 82 C55 82 26 68 26 48 V22 Z"
      strokeDasharray="3.5 2.5"
    />
    <line x1="55" y1="30" x2="55" y2="48" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="55" cy="58" r="2" fill="currentColor" />
  </svg>
);

const DiplomaRiskSketch = ({ className = "text-emerald-500" }) => (
  <svg
    viewBox="0 0 110 90"
    className={cn("w-28 h-24 overflow-visible", className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="24" y="20" width="56" height="40" rx="3" />
    <line x1="34" y1="30" x2="62" y2="30" strokeLinecap="round" />
    <line x1="34" y1="38" x2="54" y2="38" strokeLinecap="round" />
    <circle cx="70" cy="48" r="4.5" strokeWidth="1.5" />
    <path d="M70 52.5 L68 60 L70 58 L72 60 Z" fill="currentColor" />
  </svg>
);

const UsersMentoringSketch = ({ className = "text-purple-500" }) => (
  <svg
    viewBox="0 0 110 90"
    className={cn("w-28 h-24 overflow-visible", className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="45" cy="30" r="8" />
    <path d="M30 50 C30 42 38 40 45 40 C52 40 60 42 60 50" strokeLinecap="round" />
    <circle cx="70" cy="33" r="7" />
    <path d="M59 51 C60 45 66 42 72 42 C78 42 84 45 84 51" strokeLinecap="round" />
  </svg>
);

const BooksSubjectsSketch = ({ className = "text-sky-500" }) => (
  <svg
    viewBox="0 0 110 90"
    className={cn("w-28 h-24 overflow-visible", className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    {/* Book 1 */}
    <path d="M36 34 L62 24 L84 31 L58 41 Z" />
    <path d="M36 34 V39 L58 46 V41 Z" />
    <path d="M58 46 L84 36 V31 L58 41 Z" />
    {/* Book 2 */}
    <path d="M30 46 L56 36 L78 43 L52 53 Z" />
    <path d="M30 46 V51 L52 58 V53 Z" />
    <path d="M52 58 L78 48 V43 L52 53 Z" />
  </svg>
);

const CampusBuildingSketch = ({ className = "text-[#052659]" }) => (
  <svg
    viewBox="0 0 110 90"
    className={cn("w-28 h-24 overflow-visible", className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M55 16 L88 32 H22 Z" />
    <line x1="25" y1="32" x2="25" y2="60" strokeWidth="1.8" />
    <line x1="40" y1="32" x2="40" y2="60" strokeWidth="1.8" />
    <line x1="55" y1="32" x2="55" y2="60" strokeWidth="1.8" />
    <line x1="70" y1="32" x2="70" y2="60" strokeWidth="1.8" />
    <line x1="85" y1="32" x2="85" y2="60" strokeWidth="1.8" />
    <rect x="18" y="60" width="74" height="6" rx="1" />
  </svg>
);

const AcademicCapDefaultSketch = ({ className = "text-[#052659]" }) => (
  <svg
    viewBox="0 0 110 90"
    className={cn("w-28 h-24 overflow-visible", className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M55 18 L88 32 L55 45 L22 32 Z" />
    <path d="M35 39 V54 C35 54 44 61 55 61 C66 61 75 54 75 54 V39" />
    <path d="M88 32 V58" />
    <circle cx="88" cy="60" r="2" fill="currentColor" />
  </svg>
);

// 2. Color Themes exactly replicating Reference Image media_1789879005640.png
const CARD_THEMES = {
  rose: {
    bg: "bg-gradient-to-br from-[#FFF0F3] via-[#FFE4E8] to-[#FFD4DC]",
    border: "border-[#FECDD3] hover:border-rose-300",
    shadow: "shadow-[0_4px_16px_rgba(244,63,94,0.08)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.16)]",
    iconBox: "bg-white/90 border-rose-200/90 text-rose-600 shadow-2xs",
    contextText: "text-rose-600",
    sketchColor: "text-rose-500",
    waveColor: "text-rose-400",
    defaultSketch: "shield",
  },
  emerald: {
    bg: "bg-gradient-to-br from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0]/80",
    border: "border-[#BBF7D0] hover:border-emerald-300",
    shadow: "shadow-[0_4px_16px_rgba(16,185,129,0.08)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.16)]",
    iconBox: "bg-white/90 border-emerald-200/90 text-emerald-600 shadow-2xs",
    contextText: "text-emerald-700",
    sketchColor: "text-emerald-500",
    waveColor: "text-emerald-400",
    defaultSketch: "diploma",
  },
  purple: {
    bg: "bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF]/80",
    border: "border-[#DDD6FE] hover:border-purple-300",
    shadow: "shadow-[0_4px_16px_rgba(139,92,246,0.08)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.16)]",
    iconBox: "bg-white/90 border-purple-200/90 text-purple-600 shadow-2xs",
    contextText: "text-purple-700",
    sketchColor: "text-purple-500",
    waveColor: "text-purple-400",
    defaultSketch: "users",
  },
  sky: {
    bg: "bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD]/90",
    border: "border-[#BAE6FD] hover:border-sky-300",
    shadow: "shadow-[0_4px_16px_rgba(14,165,233,0.08)] hover:shadow-[0_8px_24px_rgba(14,165,233,0.16)]",
    iconBox: "bg-white/90 border-sky-200/90 text-sky-600 shadow-2xs",
    contextText: "text-sky-700",
    sketchColor: "text-sky-500",
    waveColor: "text-sky-400",
    defaultSketch: "books",
  },
  teal: {
    bg: "bg-gradient-to-br from-[#F0FDF9] via-[#E2F7F2] to-[#CCF0E8]",
    border: "border-[#99F0DE] hover:border-teal-300",
    shadow: "shadow-[0_4px_16px_rgba(20,184,166,0.08)] hover:shadow-[0_8px_24px_rgba(20,184,166,0.16)]",
    iconBox: "bg-white/90 border-teal-200/90 text-teal-700 shadow-2xs",
    contextText: "text-teal-700",
    sketchColor: "text-teal-600",
    waveColor: "text-teal-400",
    defaultSketch: "users",
  },
  navy: {
    bg: "bg-gradient-to-br from-[#F5F9FE] via-[#E8F3FD] to-[#D5EAFD]",
    border: "border-[#7DA0CA]/50 hover:border-[#0090FF]/60",
    shadow: "shadow-[0_4px_16px_rgba(5,38,89,0.08)] hover:shadow-[0_8px_24px_rgba(0,144,255,0.16)]",
    iconBox: "bg-white/90 border-[#7DA0CA]/60 text-[#052659] shadow-2xs",
    contextText: "text-[#052659]",
    sketchColor: "text-[#052659]",
    waveColor: "text-[#5483B3]",
    defaultSketch: "campus",
  },
};

// 3. Intelligent Semantic Theme Selector
const resolveCardTheme = (title = "", variant, contextType) => {
  if (variant === "backlogs") return "rose";
  if (variant === "risk") return "emerald";
  if (variant === "remedial") return "purple";
  if (variant === "subjects") return "sky";

  if (contextType === "danger") return "rose";
  if (contextType === "warning") return "rose";
  if (contextType === "success") return "emerald";

  const t = title.toLowerCase();
  if (/backlog|fail|danger|alert|attention|arrear/.test(t)) return "rose";
  if (/risk|pass|eligib/.test(t)) return "emerald";
  if (/remedial|class|support|mentor|session/.test(t)) return "purple";
  if (/subject|course|exam|mark|evaluat|syllabus|internal/.test(t)) return "sky";
  if (/student|user|enroll|peer|batch|capacity/.test(t)) return "teal";
  if (/branch|campus|dept|department|institution|college|infra|overview/.test(t)) return "navy";

  return "navy";
};

// 4. Sketch Component Dispatcher
const renderSketch = (type, sketchClass) => {
  switch (type) {
    case "shield":
      return <ShieldRiskSketch className={sketchClass} />;
    case "diploma":
      return <DiplomaRiskSketch className={sketchClass} />;
    case "users":
      return <UsersMentoringSketch className={sketchClass} />;
    case "books":
      return <BooksSubjectsSketch className={sketchClass} />;
    case "campus":
      return <CampusBuildingSketch className={sketchClass} />;
    case "cap":
    default:
      return <AcademicCapDefaultSketch className={sketchClass} />;
  }
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  contextLine,
  contextType = "neutral",
  variant, // "backlogs" | "risk" | "remedial" | "subjects"
  className,
}) => {
  const themeKey = resolveCardTheme(title, variant, contextType);
  const theme = CARD_THEMES[themeKey] || CARD_THEMES.navy;

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300 group cursor-default select-none hover:-translate-y-1",
        theme.bg,
        theme.border,
        theme.shadow,
        className
      )}
    >
      {/* 100% Full-bleed Fluid Corner Wave & Bubbles in Upper-Left (Zero Gaps) */}
      <svg
        className={cn(
          "absolute top-0 left-0 w-36 h-24 pointer-events-none opacity-40 overflow-hidden",
          theme.waveColor
        )}
        viewBox="0 0 140 85"
        fill="none"
      >
        <path
          d="M0 0 H95 C75 18, 65 38, 48 44 C30 50, 16 68, 0 78 Z"
          fill="currentColor"
          opacity="0.25"
        />
        <circle cx="68" cy="26" r="3.5" fill="currentColor" opacity="0.35" />
        <circle cx="36" cy="52" r="5" fill="currentColor" opacity="0.25" />
      </svg>

      {/* 100% Full-bleed Flowing Double Wave Lines across Card Bottom */}
      <svg
        className={cn(
          "absolute bottom-0 right-0 w-full h-20 pointer-events-none opacity-40 overflow-hidden",
          theme.waveColor
        )}
        viewBox="0 0 300 70"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M20 40 Q 110 20, 185 45 T 300 32"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.6"
        />
        <path
          d="M0 55 Q 90 35, 165 60 T 300 46"
          stroke="currentColor"
          strokeWidth="1.0"
          opacity="0.4"
        />
      </svg>

      {/* Right-Side Content-Aware Line Sketch Watermark */}
      <div className="absolute right-2.5 top-2.5 bottom-0 w-32 pointer-events-none opacity-35 group-hover:opacity-55 transition-opacity duration-300 flex items-center justify-end overflow-hidden">
        {renderSketch(theme.defaultSketch, theme.sketchColor)}
      </div>

      {/* Card Content: Title on top, Icon + Value + Context on bottom */}
      <CardContent className="p-3.5 sm:p-4 relative z-10 flex flex-col justify-between h-full min-h-[105px]">
        <span className="text-[11.5px] sm:text-xs font-bold text-slate-800 tracking-tight truncate">
          {title}
        </span>
        <div className="flex items-center gap-3 mt-2">
          {Icon && (
            <div
              className={cn(
                "w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105",
                theme.iconBox
              )}
            >
              <Icon className="w-4.5 h-4.5" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none tracking-tight">
              {value}
            </span>
            {contextLine && (
              <span className={cn("text-[10px] sm:text-[10.5px] font-bold mt-1 tracking-tight truncate", theme.contextText)}>
                {contextLine}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
