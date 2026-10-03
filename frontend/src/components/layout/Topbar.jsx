import React, { useEffect, useState } from "react";
import { getAvatarUrl } from "@/utils/urlUtils";
import { Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notificationService";
import { studentService } from "@/services/studentService";
import { ProfileModal } from "../common/ProfileModal";

export const Topbar = ({ onMenuToggle, title = "Dashboard" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [studentProfile, setStudentProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        if (user) {
          const count = await notificationService.getUnreadCount();
          if (isMounted) setUnreadCount(count);
        }
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (user?.role === "STUDENT") {
        try {
          const profileData = await studentService.getProfile();
          if (isMounted && profileData) {
            setStudentProfile(profileData);
          }
        } catch (e) {
          console.error("Failed to fetch student profile", e);
        }
      }
    };
    fetchProfile();

    const handleProfileUpdate = async () => {
      setForceUpdate((prev) => prev + 1);
      try {
        await authService.validateToken();
        fetchProfile();
      } catch {
        // ignore
      }
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goToNotifications = async () => {
    if (user?.role === "ADMIN") {
      navigate("/admin/notices");
      return;
    }
    if (user?.role === "CTPO") {
      navigate("/ctpo/notices");
      return;
    }
    const rolePath =
      user?.role?.toLowerCase() === "student"
        ? "student"
        : user?.role?.toLowerCase() === "coordinator"
          ? "coordinator"
          : "admin";
    navigate(`/${rolePath}/notifications`);
  };

  const displayName =
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "") ||
    (user?.role === "STUDENT" ? studentProfile?.name : null) ||
    user?.username || 
    "Academic User";

  const userIdentifier =
    user?.role === "STUDENT" && studentProfile?.rollNo
      ? studentProfile.rollNo
      : displayName;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#7DA0CA]/35 bg-gradient-to-r from-[#f0f6fc]/95 via-[#eaf2fa]/95 to-[#f3f8fd]/95 backdrop-blur-md px-3.5 sm:px-5 shadow-2xs">
      {/* Left side: Mobile menu toggle + Page title & subtitle matching Image 1 */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-[#052659] hover:bg-[#C1E8FF]/30 h-9 w-9"
          onClick={onMenuToggle}
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2.5 truncate">
          <h1 className="text-lg sm:text-xl font-bold text-[#021024] tracking-tight truncate">
            {title}
          </h1>
          <span className="text-[#7DA0CA]/70 select-none font-light">|</span>
          <span className="text-xs sm:text-sm font-medium text-slate-500 truncate">
            {user?.role === "STUDENT" ? "Student Overview" : `${user?.role || "System"} Portal`}
          </span>
        </div>
      </div>

      {/* Right side: Notifications, Profile Pill, Direct Sign-out */}
      <div className="flex items-center gap-3 shrink-0">
        <TooltipProvider delayDuration={150}>
          {user?.role !== "PRINCIPAL" && user?.role !== "HOD" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-[#052659] hover:bg-[#C1E8FF]/40 hover:text-[#021024] h-9 w-9 rounded-lg"
                  onClick={goToNotifications}
                  aria-label="View notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && user?.role !== "STUDENT" && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Notifications</TooltipContent>
            </Tooltip>
          )}

          {/* User Profile Direct Trigger matching Image 1 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 py-1 px-2 rounded-xl transition-all hover:bg-[#C1E8FF]/30 focus:outline-none focus:ring-2 focus:ring-[#0090FF]/50"
                aria-label="Open User Account Profile"
              >
                <Avatar className="h-8 w-8 border border-[#0090FF]/40 shadow-xs bg-[#052659]">
                  <AvatarImage
                    src={getAvatarUrl(user?.avatarFileId || user?.avatar)}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-[#052659] text-white text-xs font-bold">
                    {(user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-[#021024] tracking-tight uppercase">
                    {userIdentifier}
                  </span>
                  <span className="text-[10px] text-[#0090FF] font-bold tracking-wider uppercase mt-0.5">
                    {user?.role}
                  </span>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">View Account Profile</TooltipContent>
          </Tooltip>

          {/* Dedicated Direct Sign Out Button matching Image 1 door-exit icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Sign out</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Shared Desktop Profile Dialog (Opens exactly once) */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        studentProfile={studentProfile}
      />
    </header>
  );
};
