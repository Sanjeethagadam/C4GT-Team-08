import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, AlertTriangle, 
  Settings, GraduationCap, Building, Bell,
  GitMerge, Calendar, CalendarDays, UploadCloud, FileText
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  const navItems = {
    STUDENT: [
      { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'My Marks', path: '/student/marks', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'My Results', path: '/student/results', icon: <GraduationCap className="w-5 h-5" /> },
      { name: 'My Backlogs', path: '/student/backlogs', icon: <AlertTriangle className="w-5 h-5" /> },
      { name: 'Remedial Classes', path: '/student/remedial', icon: <Users className="w-5 h-5" /> },
      { name: 'Guest Lectures', path: '/student/guest-lectures', icon: <CalendarDays className="w-5 h-5" /> },
      { name: 'Notifications', path: '/student/notifications', icon: <Bell className="w-5 h-5" /> },
    ],
    CTPO: [
      { name: 'My Class Dashboard', path: '/ctpo/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Class Performance', path: '/ctpo/performance', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'My Students', path: '/ctpo/students', icon: <Users className="w-5 h-5" /> },
      { name: 'Class Subjects', path: '/ctpo/subjects', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'Marks Entry', path: '/ctpo/marks', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'Class Results', path: '/ctpo/results', icon: <GraduationCap className="w-5 h-5" /> },
      { name: 'Class Backlogs', path: '/ctpo/backlogs', icon: <AlertTriangle className="w-5 h-5" /> },
      { name: 'Notices / Timetables', path: '/ctpo/notices', icon: <UploadCloud className="w-5 h-5" /> },
    ],
    HOD: [
      { name: 'Dashboard', path: '/hod/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Performance', path: '/hod/performance', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'Results', path: '/hod/results', icon: <GraduationCap className="w-5 h-5" /> },
      { name: 'Backlogs', path: '/hod/backlogs', icon: <AlertTriangle className="w-5 h-5" /> },
      { name: 'Risk', path: '/hod/risk', icon: <AlertTriangle className="w-5 h-5" /> },
      { name: 'Remedial', path: '/hod/remedial', icon: <Users className="w-5 h-5" /> },
    ],
    PRINCIPAL: [
      { name: 'Dashboard', path: '/principal/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Campus Overview', path: '/principal/campus-overview', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'Branches', path: '/principal/branches', icon: <Users className="w-5 h-5" /> },
      { name: 'Years', path: '/principal/years', icon: <GraduationCap className="w-5 h-5" /> },
      { name: 'Drill-down', path: '/principal/drill-down', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'Backlogs', path: '/principal/backlogs', icon: <AlertTriangle className="w-5 h-5" /> },
      { name: 'Risk', path: '/principal/risk', icon: <AlertTriangle className="w-5 h-5" /> },
      { name: 'Remedial', path: '/principal/remedial', icon: <Users className="w-5 h-5" /> },
      { name: 'Guest Lectures', path: '/principal/guest-lectures', icon: <Users className="w-5 h-5" /> },
    ],
    COORDINATOR: [
      { name: 'Dashboard', path: '/coordinator/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Remedial Classes', path: '/coordinator/remedial-classes', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'Backlog Students', path: '/coordinator/backlog-students', icon: <AlertTriangle className="w-5 h-5" /> },
      { name: 'Attendance/Progress', path: '/coordinator/attendance', icon: <Users className="w-5 h-5" /> },
      { name: 'Guest Lectures', path: '/coordinator/guest-lectures', icon: <GraduationCap className="w-5 h-5" /> },
      { name: 'Notifications', path: '/coordinator/notifications', icon: <Bell className="w-5 h-5" /> },
    ],
    ADMIN: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Result Import', path: '/admin/import', icon: <UploadCloud className="w-5 h-5" /> },
      { name: 'Users & Access', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
      { name: 'Campuses', path: '/admin/campus', icon: <Building className="w-5 h-5" /> },
      { name: 'Branches', path: '/admin/branches', icon: <GitMerge className="w-5 h-5" /> },
      { name: 'Campus–Branch Mapping', path: '/admin/campus-branch-link', icon: <GitMerge className="w-5 h-5" /> },
      { name: 'Academic Years', path: '/admin/academic-years', icon: <Calendar className="w-5 h-5" /> },
      { name: 'Semesters', path: '/admin/semesters', icon: <CalendarDays className="w-5 h-5" /> },
      { name: 'Subjects', path: '/admin/subjects', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'System Configuration', path: '/admin/system-config', icon: <Settings className="w-5 h-5" /> },
      { name: 'Notices', path: '/admin/notices', icon: <FileText className="w-5 h-5" /> },
    ],
  };

  const currentNavItems = navItems[role as keyof typeof navItems] || navItems.STUDENT;

  return (
    <aside className={`w-64 bg-[#bfdbfe] border-r border-blue-300 text-slate-800 flex-shrink-0 flex flex-col h-full ${className || ''}`}>
      <div className="p-4 py-6">
        <h2 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-4 px-3">
          Main Menu
        </h2>
        <nav className="space-y-1.5">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-800 hover:bg-blue-300 hover:text-blue-950'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-blue-300/80">
        <div className="bg-white/95 border border-blue-200 rounded-2xl p-3 text-sm shadow-xs">
          <p className="text-slate-500 text-xs mb-1">Current Term</p>
          <p className="text-slate-900 font-medium">Fall Semester 2026</p>
        </div>
      </div>
    </aside>
  );
};