import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  AlertTriangle,
  Settings,
  GraduationCap,
  Building,
  Bell,
  GitMerge,
  Calendar,
  CalendarDays,
  UploadCloud,
  FileText,
  Shield,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useActiveAcademicSession } from "@/hooks/useActiveAcademicSession";

export const Sidebar = ({ className }) => {
  const { user } = useAuth();
  const activeSessionString = useActiveAcademicSession();
  const role = user?.role || "STUDENT";

  // Navigation configurations mapped precisely per academic role
  const navItems = {
    STUDENT: [
      {
        name: "Dashboard",
        path: "/student/dashboard",
        icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      },
      {
        name: "My Marks",
        path: "/student/marks",
        icon: <BookOpen className="w-4 h-4 shrink-0" />,
      },
      {
        name: "My Results",
        path: "/student/results",
        icon: <GraduationCap className="w-4 h-4 shrink-0" />,
      },
      {
        name: "My Backlogs",
        path: "/student/backlogs",
        icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Remedial Classes",
        path: "/student/remedial",
        icon: <Users className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Guest Lectures",
        path: "/student/guest-lectures",
        icon: <CalendarDays className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Notifications",
        path: "/student/notifications",
        icon: <Bell className="w-4 h-4 shrink-0" />,
      },
    ],
    CTPO: [
      {
        name: "Class Dashboard",
        path: "/ctpo/dashboard",
        icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Class Performance",
        path: "/ctpo/performance",
        icon: <Activity className="w-4 h-4 shrink-0" />,
      },
      {
        name: "My Students",
        path: "/ctpo/students",
        icon: <Users className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Class Subjects",
        path: "/ctpo/subjects",
        icon: <BookOpen className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Marks Entry",
        path: "/ctpo/marks",
        icon: <FileText className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Class Results",
        path: "/ctpo/results",
        icon: <GraduationCap className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Class Backlogs",
        path: "/ctpo/backlogs",
        icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Notices / Timetable",
        path: "/ctpo/notices",
        icon: <UploadCloud className="w-4 h-4 shrink-0" />,
      },
    ],
    HOD: [
      {
        name: "Dashboard",
        path: "/hod/dashboard",
        icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Department Performance",
        path: "/hod/performance",
        icon: <Activity className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Results Analytics",
        path: "/hod/results",
        icon: <GraduationCap className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Backlog Trends",
        path: "/hod/backlogs",
        icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Risk Assessment",
        path: "/hod/risk",
        icon: <Shield className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Guest Lectures",
        path: "/hod/guest-lectures",
        icon: <Users className="w-4 h-4 shrink-0" />,
      },
    ],
    PRINCIPAL: [
      {
        name: "Dashboard",
        path: "/principal/dashboard",
        icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Campus Overview",
        path: "/principal/campus-overview",
        icon: <Building className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Branches",
        path: "/principal/branches",
        icon: <GitMerge className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Academic Years",
        path: "/principal/years",
        icon: <Calendar className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Drill-Down Analytics",
        path: "/principal/drill-down",
        icon: <Activity className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Backlog Analytics",
        path: "/principal/backlogs",
        icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Risk Overview",
        path: "/principal/risk",
        icon: <Shield className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Remedial Monitoring",
        path: "/principal/remedial",
        icon: <Users className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Guest Lectures",
        path: "/principal/guest-lectures",
        icon: <CalendarDays className="w-4 h-4 shrink-0" />,
      },
    ],
    COORDINATOR: [
      {
        name: "Dashboard",
        path: "/coordinator/dashboard",
        icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Remedial Classes",
        path: "/coordinator/remedial-classes",
        icon: <Users className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Backlog Students",
        path: "/coordinator/backlog-students",
        icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Attendance / Progress",
        path: "/coordinator/attendance",
        icon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Guest Lectures",
        path: "/coordinator/guest-lectures",
        icon: <CalendarDays className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Notifications",
        path: "/coordinator/notifications",
        icon: <Bell className="w-4 h-4 shrink-0" />,
      },
    ],
    ADMIN: [
      {
        name: "System Dashboard",
        path: "/admin/dashboard",
        icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Result Import",
        path: "/admin/import",
        icon: <UploadCloud className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Users & Access",
        path: "/admin/users",
        icon: <Users className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Campuses",
        path: "/admin/campus",
        icon: <Building className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Branches",
        path: "/admin/branches",
        icon: <GitMerge className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Campus–Branch Link",
        path: "/admin/campus-branch-link",
        icon: <GitMerge className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Academic Years",
        path: "/admin/academic-years",
        icon: <Calendar className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Semesters",
        path: "/admin/semesters",
        icon: <CalendarDays className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Subjects",
        path: "/admin/subjects",
        icon: <BookOpen className="w-4 h-4 shrink-0" />,
      },
      {
        name: "System Configuration",
        path: "/admin/system-config",
        icon: <Settings className="w-4 h-4 shrink-0" />,
      },
      {
        name: "Notices Management",
        path: "/admin/notices",
        icon: <FileText className="w-4 h-4 shrink-0" />,
      },
    ],
  };

  const currentNavItems = navItems[role] || navItems.STUDENT;

  return (
    <aside
      className={`w-[220px] bg-[#021024] text-[#C1E8FF] flex-shrink-0 flex flex-col h-full border-r border-[#052659] select-none relative overflow-hidden ${className || ""}`}
    >
      {/* Reference Image 1: Dark Blue Texture, Subtle Streaks & Depth */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-40 mix-blend-screen"
        style={{ backgroundImage: `url('/nav_dark_blue_bg.png')` }}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#021024]/75 via-[#021024]/30 to-[#021024]/85" />

      {/* Brand Header */}
      <div className="h-14 flex items-center gap-2.5 px-3.5 border-b border-[#052659]/70 bg-[#021024]/90 relative z-10">
        <div className="h-8 w-8 rounded-full bg-[#052659] border border-[#0090FF]/50 flex items-center justify-center text-white shadow-[0_0_10px_rgba(0,144,255,0.3)] shrink-0">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold tracking-tight text-white truncate">
              KIET AMS
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#0090FF] inline-block shrink-0 shadow-[0_0_6px_#0090FF]"></span>
          </div>
          <span className="text-[9.5px] text-[#7DA0CA] font-bold tracking-wider uppercase truncate">
            {role} PORTAL
          </span>
        </div>
      </div>

      {/* Navigation Links - Slightly larger font size & classy active finish */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1.5 relative z-10">
        <p className="text-[10.5px] font-bold text-[#7DA0CA] uppercase tracking-widest px-2 mb-1.5">
          ACADEMIC NAVIGATION
        </p>
        <nav className="space-y-1">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-[13px] leading-snug group relative ${
                  isActive
                    ? "bg-gradient-to-r from-[#07306b] via-[#0A3D8A] to-[#06295c] text-white border border-[#5483B3]/60 shadow-[0_2px_8px_rgba(5,38,89,0.45),inset_0_1px_1px_rgba(193,232,255,0.3)] font-semibold"
                    : "text-[#C1E8FF]/90 hover:bg-[#052659]/65 hover:text-white font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#0090FF] shadow-[0_0_6px_#0090FF]" />
                  )}
                  <span className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-[#C1E8FF]/80 group-hover:text-white"}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Institutional Context Footer - Exact Recreation */}
      <div className="p-2.5 border-t border-[#052659]/70 bg-[#021024]/95 relative z-10">
        <div className="bg-[#052659]/50 border border-[#5483B3]/30 rounded-lg p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[#C1E8FF]/80 text-[10px] font-medium">
              Academic Session
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active
            </span>
          </div>
          <p className="text-white text-[11px] font-bold mt-1 tracking-tight">
            Academic Year {activeSessionString}
          </p>
        </div>
      </div>
    </aside>
  );
};
