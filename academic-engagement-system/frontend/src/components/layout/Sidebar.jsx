import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Award,
  Calendar,
  AlertTriangle,
  User,
  BookOpen,
  Layers,
  Building2,
  GraduationCap,
  LogOut,
  X,
  Shield,
} from "lucide-react";

export const Sidebar = ({ isOpen, onClose }) => {
  const { role, user, logout } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case "CTPO":
        return [
          { to: "/ctpo/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/ctpo/students", label: "Students", icon: Users },
          { to: "/ctpo/mid-marks", label: "Mid Marks", icon: Award },
          { to: "/ctpo/timetable", label: "Timetable", icon: Calendar },
          { to: "/ctpo/risk-analysis", label: "Risk Analysis", icon: AlertTriangle },
        ];
      case "STUDENT":
        return [
          { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/student/mid-marks", label: "Mid Marks", icon: Award },
          { to: "/student/timetable", label: "Timetable", icon: Calendar },
          { to: "/student/backlogs", label: "Backlogs", icon: BookOpen },
          { to: "/student/profile", label: "Profile", icon: User },
        ];
      case "HOD":
        return [
          { to: "/hod/dashboard", label: "Department Dashboard", icon: LayoutDashboard },
        ];
      case "PRINCIPAL":
        return [
          { to: "/principal/dashboard", label: "Campus Dashboard", icon: Building2 },
        ];
      case "COORDINATOR":
        return [
          { to: "/coordinator/dashboard", label: "Curriculum Overview", icon: Layers },
        ];
      case "ADMIN":
        return [
          { to: "/admin/dashboard", label: "System Administration", icon: LayoutDashboard },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-academic-800 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base tracking-tight leading-snug">
                Academic Portal
              </span>
              <span className="text-xs font-semibold text-sky-600 tracking-wide uppercase">
                Engagement System
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] transition-all ${
                    isActive
                      ? "bg-academic-50 text-academic-900 font-semibold border border-academic-200/60 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4.5 h-4.5 shrink-0 stroke-[1.8] ${isActive ? "text-academic-700" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout at bottom */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-academic-100 text-academic-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.username || "Authenticated"}
                  </p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {role || "USER"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
