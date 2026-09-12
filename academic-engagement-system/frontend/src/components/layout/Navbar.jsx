import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Bell, Menu, Shield, GraduationCap, Building2 } from "lucide-react";
import { Badge } from "../common/Badge";

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, role } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/ctpo/dashboard")) return "CTPO Overview";
    if (path.includes("/ctpo/students")) return "Branch Students";
    if (path.includes("/ctpo/mid-marks")) return "Mid Marks Evaluation";
    if (path.includes("/ctpo/timetable")) return "Timetable Schedules";
    if (path.includes("/ctpo/risk-analysis")) return "Risk & Performance Analysis";
    if (path.includes("/student/dashboard")) return "Student Portal";
    if (path.includes("/student/mid-marks")) return "Mid Examination Marks";
    if (path.includes("/student/timetable")) return "Academic Timetables";
    if (path.includes("/student/backlogs")) return "Supplementary & Backlog Records";
    if (path.includes("/student/profile")) return "Academic Profile";
    if (path.includes("/admin")) return "Master Administration";
    if (path.includes("/hod")) return "HOD Department Portal";
    if (path.includes("/principal")) return "Campus Administration";
    if (path.includes("/coordinator")) return "Curriculum Coordination";
    return "Academic Engagement System";
  };

  const getRoleBadgeVariant = (userRole) => {
    switch (userRole) {
      case "CTPO":
        return "academic";
      case "STUDENT":
        return "success";
      case "ADMIN":
        return "danger";
      case "HOD":
        return "purple";
      case "PRINCIPAL":
        return "warning";
      case "COORDINATOR":
        return "info";
      default:
        return "default";
    }
  };

  const branchScopeName = user?.scopeRef?.type === "BRANCH" ? `Branch CTPO` : null;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-card">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {getPageTitle()}
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-500 hidden sm:block">
            Academic Engagement Management Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* CTPO Branch Scope indicator */}
        {role === "CTPO" && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-academic-50 border border-academic-200/80 text-academic-800 text-[13px] font-semibold">
            <Building2 className="w-4 h-4 text-academic-600" />
            <span>Assigned Branch Scope</span>
          </div>
        )}

        {/* Role Badge */}
        <Badge variant={getRoleBadgeVariant(role)} size="md">
          <Shield className="w-3.5 h-3.5" />
          <span>{role || "USER"}</span>
        </Badge>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">
              {user?.username || "Authenticated"}
            </p>
            <p className="text-xs font-normal text-slate-500">
              {branchScopeName || "Academic Member"}
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl bg-academic-100 border border-academic-200 text-academic-800 flex items-center justify-center font-bold text-sm shadow-xs">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
