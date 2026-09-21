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
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export const Sidebar = ({ className }) => {
  const { user } = useAuth();
  const role = user?.role || "STUDENT";

  // Define navigation items per role
  const navItems = {
    STUDENT: [
      {
        name: "Dashboard",
        path: "/student/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        name: "My Marks",
        path: "/student/marks",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        name: "My Results",
        path: "/student/results",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        name: "My Backlogs",
        path: "/student/backlogs",
        icon: <AlertTriangle className="w-5 h-5" />,
      },
      {
        name: "Remedial Classes",
        path: "/student/remedial",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "Guest Lectures",
        path: "/student/guest-lectures",
        icon: <CalendarDays className="w-5 h-5" />,
      },
      {
        name: "Notifications",
        path: "/student/notifications",
        icon: <Bell className="w-5 h-5" />,
      },
    ],
    CTPO: [
      {
        name: "My Class Dashboard",
        path: "/ctpo/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        name: "Class Performance",
        path: "/ctpo/performance",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        name: "My Students",
        path: "/ctpo/students",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "Class Subjects",
        path: "/ctpo/subjects",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        name: "Marks Entry",
        path: "/ctpo/marks",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        name: "Class Results",
        path: "/ctpo/results",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        name: "Class Backlogs",
        path: "/ctpo/backlogs",
        icon: <AlertTriangle className="w-5 h-5" />,
      },
      {
        name: "Notices / Timetables",
        path: "/ctpo/notices",
        icon: <UploadCloud className="w-5 h-5" />,
      },
    ],
    HOD: [
      {
        name: "Dashboard",
        path: "/hod/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        name: "Performance",
        path: "/hod/performance",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        name: "Results",
        path: "/hod/results",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        name: "Backlogs",
        path: "/hod/backlogs",
        icon: <AlertTriangle className="w-5 h-5" />,
      },
      {
        name: "Risk",
        path: "/hod/risk",
        icon: <AlertTriangle className="w-5 h-5" />,
      },
      {
        name: "Guest Lectures",
        path: "/hod/guest-lectures",
        icon: <Users className="w-5 h-5" />,
      },
    ],
    PRINCIPAL: [
      {
        name: "Dashboard",
        path: "/principal/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        name: "Campus Overview",
        path: "/principal/campus-overview",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        name: "Branches",
        path: "/principal/branches",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "Years",
        path: "/principal/years",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        name: "Drill-down",
        path: "/principal/drill-down",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        name: "Backlogs",
        path: "/principal/backlogs",
        icon: <AlertTriangle className="w-5 h-5" />,
      },
      {
        name: "Risk",
        path: "/principal/risk",
        icon: <AlertTriangle className="w-5 h-5" />,
      },
      {
        name: "Remedial",
        path: "/principal/remedial",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "Guest Lectures",
        path: "/principal/guest-lectures",
        icon: <Users className="w-5 h-5" />,
      },
    ],
    COORDINATOR: [
      {
        name: "Dashboard",
        path: "/coordinator/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        name: "Remedial Classes",
        path: "/coordinator/remedial-classes",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        name: "Backlog Students",
        path: "/coordinator/backlog-students",
        icon: <AlertTriangle className="w-5 h-5" />,
      },
      {
        name: "Attendance/Progress",
        path: "/coordinator/attendance",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "Guest Lectures",
        path: "/coordinator/guest-lectures",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        name: "Notifications",
        path: "/coordinator/notifications",
        icon: <Bell className="w-5 h-5" />,
      },
    ],
    ADMIN: [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        name: "Result Import",
        path: "/admin/import",
        icon: <UploadCloud className="w-5 h-5" />,
      },
      {
        name: "Users & Access",
        path: "/admin/users",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "Campuses",
        path: "/admin/campus",
        icon: <Building className="w-5 h-5" />,
      },
      {
        name: "Branches",
        path: "/admin/branches",
        icon: <GitMerge className="w-5 h-5" />,
      },
      {
        name: "Campus–Branch Mapping",
        path: "/admin/campus-branch-link",
        icon: <GitMerge className="w-5 h-5" />,
      },
      {
        name: "Academic Years",
        path: "/admin/academic-years",
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        name: "Semesters",
        path: "/admin/semesters",
        icon: <CalendarDays className="w-5 h-5" />,
      },
      {
        name: "Subjects",
        path: "/admin/subjects",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        name: "System Configuration",
        path: "/admin/system-config",
        icon: <Settings className="w-5 h-5" />,
      },
      {
        name: "Notices",
        path: "/admin/notices",
        icon: <FileText className="w-5 h-5" />,
      },
    ],
  };

  const currentNavItems = navItems[role] || navItems.STUDENT;

  return (
    <aside
      className={`w-64 bg-gradient-to-b from-[#4C1D95] via-[#461A8A] to-[#3B1277] text-purple-100 flex-shrink-0 flex flex-col h-full border-r border-[#5B21B6]/50 select-none shadow-lg ${className || ""}`}
    >
      {/* Sidebar Top Brand */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 bg-black/10">
        <div className="h-9 w-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-sm shrink-0">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            SAMS Portal
            <span className="h-2 w-2 rounded-full bg-purple-300 shadow-[0_0_8px_rgba(216,180,254,0.8)]"></span>
          </span>
          <span className="text-[11px] font-medium text-purple-200 truncate">
            Digital Permission System
          </span>
        </div>
      </div>

      <div className="p-4 py-5 flex-1 overflow-y-auto">
        <h2 className="text-[11px] font-bold text-purple-200/70 uppercase tracking-wider mb-3 px-3">
          Main Menu
        </h2>
        <nav className="space-y-1.5">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? "bg-white/20 text-white font-bold border-l-[4px] border-purple-200 pl-[8px] shadow-sm backdrop-blur-xs"
                    : "text-purple-200 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <span className="shrink-0 text-white">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/10 bg-black/15">
        <div className="bg-white/10 border border-white/15 rounded-xl p-3 text-sm backdrop-blur-xs shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <p className="text-purple-200 text-xs font-medium">Current Term</p>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
          </div>
          <p className="text-white font-bold text-xs tracking-wide">
            Fall Semester 2026
          </p>
        </div>
      </div>
    </aside>
  );
};
