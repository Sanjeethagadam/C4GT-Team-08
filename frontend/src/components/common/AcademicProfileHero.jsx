import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, User } from "lucide-react";
import academicIllustration from "@/assets/academic_vector_illustration.png";
import { cn } from "@/utils";
import { getAvatarUrl } from "@/utils/urlUtils";

export const AcademicProfileHero = ({
  title = "Academic Profile",
  icon: TitleIcon = GraduationCap,
  name = "Academic User",
  avatar,
  fallbackText,
  badges = [],
  visionTitle = "Academic Vision",
  visionWords = ["Dream", "Learn", "Achieve"],
  className,
}) => {
  const resolvedAvatar = avatar
    ? avatar.startsWith?.("http") || avatar.startsWith?.("data:")
      ? avatar
      : getAvatarUrl(avatar)
    : "";

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#021024] via-[#052659] to-[#0A3670] border border-[#5483B3]/35 shadow-lg text-white select-none",
        className
      )}
    >
      {/* Ambient background glow elements */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#0090FF]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-16 w-80 h-80 rounded-full bg-[#5483B3]/25 blur-3xl pointer-events-none" />

      <CardContent className="p-5 sm:p-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Column: Role Details */}
          <div className="flex-1 space-y-3.5">
            {/* Role Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#021024]/85 border border-[#5483B3]/40 text-[#C1E8FF] text-[11px] font-semibold tracking-wide shadow-xs">
              <TitleIcon className="w-3.5 h-3.5 text-[#0090FF]" />
              <span>{title}</span>
            </div>

            {/* Avatar + User Name */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#7DA0CA]/50 p-0.5 bg-[#021024] flex items-center justify-center shrink-0 shadow-sm">
                <Avatar className="w-full h-full rounded-full">
                  <AvatarImage src={resolvedAvatar} alt={name} className="object-cover" />
                  <AvatarFallback className="bg-[#052659] text-white">
                    {fallbackText ? (
                      <span className="font-bold text-sm tracking-wider uppercase text-[#C1E8FF]">
                        {fallbackText}
                      </span>
                    ) : (
                      <User className="w-7 h-7 text-[#C1E8FF]" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-wide uppercase truncate">
                  {name}
                </h2>
              </div>
            </div>

            {/* Metadata Badges Row */}
            {badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {badges.map((b, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs",
                      b.highlight
                        ? "bg-[#032B44]/90 border border-[#0090FF]/50 text-white"
                        : "bg-[#021024]/85 border border-[#5483B3]/40 text-[#C1E8FF]"
                    )}
                  >
                    {b.dotColor && (
                      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", b.dotColor)} />
                    )}
                    {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Dream Learn Achieve Typography + 3D Academic Illustration with micro-motion */}
          <div className="hidden sm:flex items-center gap-5 lg:gap-7 shrink-0 self-center">
            <div className="text-right select-none space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7DA0CA]/90 block">
                {visionTitle}
              </span>
              {visionWords.map((word, wIdx) => (
                <div
                  key={wIdx}
                  className={cn(
                    "text-lg sm:text-xl font-bold tracking-tight font-sans",
                    wIdx === 0
                      ? "text-white"
                      : wIdx === 1
                        ? "text-[#C1E8FF]"
                        : "text-[#0090FF]"
                  )}
                >
                  {word}
                </div>
              ))}
            </div>

            {/* Vector Academic Illustration with gentle floating micro-animation */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center group">
              <div className="absolute inset-1 rounded-full bg-[#0090FF]/25 blur-xl pointer-events-none animate-pulse" />
              <img
                src={academicIllustration}
                alt="Academic Cap and Books"
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] animate-gentle-float select-none pointer-events-none"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
