import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StylePreview } from './pages/StylePreview';
import { Login } from './pages/Login';
import { Forbidden } from './pages/Forbidden';
import { ProtectedRoute } from './app/router/ProtectedRoute';
import { AuthProvider, useAuth } from './providers/AuthProvider';

import { StudentDashboard } from './modules/student/pages/Dashboard';
import { MyMarks } from './modules/student/pages/MyMarks';
import { MyResults } from './modules/student/pages/MyResults';
import { MyBacklogs } from './modules/student/pages/MyBacklogs';
import { RemedialClasses } from './modules/student/pages/RemedialClasses';
import { GuestLectures } from './modules/student/pages/GuestLectures';
import { Notifications } from './modules/student/pages/Notifications';
import { CtpoDashboard } from './modules/ctpo/pages/Dashboard';
import { Performance as CtpoPerformance } from './modules/ctpo/pages/Performance';
import { Students as CtpoStudents } from './modules/ctpo/pages/Students';
import { Subjects as CtpoSubjects } from './modules/ctpo/pages/Subjects';
import { Results as CtpoResults } from './modules/ctpo/pages/Results';
import { Backlogs as CtpoBacklogs } from './modules/ctpo/pages/Backlogs';
import { Notices as CtpoNotices } from './modules/ctpo/pages/Notices';

import { MarkEntry as CtpoMarkEntry } from './modules/ctpo/pages/MarkEntry';
import { StudentProfile as CtpoStudentProfile } from './modules/ctpo/pages/StudentProfile';
import { Dashboard as HodDashboard } from './modules/hod/pages/Dashboard';
import { Performance as HodPerformance } from './modules/hod/pages/Performance';
import { Results as HodResults } from './modules/hod/pages/Results';
import { Backlogs as HodBacklogs } from './modules/hod/pages/Backlogs';
import { Risk as HodRisk } from './modules/hod/pages/Risk';
import { Remedial as HodRemedial } from './modules/hod/pages/Remedial';
import { Dashboard as PrincipalDashboard } from './modules/principal/pages/Dashboard';
import { CampusOverview as PrincipalCampusOverview } from './modules/principal/pages/CampusOverview';
import { DrillDown as PrincipalDrillDown } from './modules/principal/pages/DrillDown';
import { Branches as PrincipalBranches } from './modules/principal/pages/Branches';
import { Years as PrincipalYears } from './modules/principal/pages/Years';
import { Backlogs as PrincipalBacklogs } from './modules/principal/pages/Backlogs';
import { Risk as PrincipalRisk } from './modules/principal/pages/Risk';
import { Remedial as PrincipalRemedial } from './modules/principal/pages/Remedial';
import { GuestLectures as PrincipalGuestLectures } from './modules/principal/pages/GuestLectures';
import { Dashboard as CoordinatorDashboard } from './modules/coordinator/pages/Dashboard';
import { RemedialClasses as CoordinatorRemedialClasses } from './modules/coordinator/pages/RemedialClasses';
import { BacklogStudents as CoordinatorBacklogStudents } from './modules/coordinator/pages/BacklogStudents';
import { AttendanceProgress as CoordinatorAttendanceProgress } from './modules/coordinator/pages/AttendanceProgress';
import { GuestLectures as CoordinatorGuestLectures } from './modules/coordinator/pages/GuestLectures';
import { Notifications as CoordinatorNotifications } from './modules/coordinator/pages/Notifications';
import { Dashboard as AdminDashboard } from './modules/admin/pages/Dashboard';
import { Users as AdminUsers } from './modules/admin/pages/Users';
import { Campus as AdminCampus } from './modules/admin/pages/Campus';
import { Branches as AdminBranches } from './modules/admin/pages/Branches';
import { AcademicYears as AdminAcademicYears } from './modules/admin/pages/AcademicYears';
import { Semesters as AdminSemesters } from './modules/admin/pages/Semesters';
import { Subjects as AdminSubjects } from './modules/admin/pages/Subjects';
import { SystemConfiguration as AdminSystemConfiguration } from './modules/admin/pages/SystemConfiguration';
import { ResultImport as AdminResultImport } from './modules/admin/pages/ResultImport';
import { CampusBranchLinkPage as AdminCampusBranchLink } from './modules/admin/pages/CampusBranchLink';
import { Sections as AdminSections } from './modules/admin/pages/Sections';
import { Notices as AdminNotices } from './modules/admin/pages/Notices';

function RootRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/preview" element={<StylePreview />} />

          {/* Root Redirect - dynamic based on auth and role */}
          <Route path="/" element={<RootRedirect />} />

          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/marks" element={<MyMarks />} />
            <Route path="/student/results" element={<MyResults />} />
            <Route path="/student/backlogs" element={<MyBacklogs />} />
            <Route path="/student/remedial" element={<RemedialClasses />} />
            <Route path="/student/guest-lectures" element={<GuestLectures />} />
            <Route path="/student/notifications" element={<Notifications />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['CTPO']} />}>
            <Route path="/ctpo/dashboard" element={<CtpoDashboard />} />
            <Route path="/ctpo/performance" element={<CtpoPerformance />} />
            <Route path="/ctpo/students" element={<CtpoStudents />} />
            <Route path="/ctpo/students/:id" element={<CtpoStudentProfile />} />
            <Route path="/ctpo/subjects" element={<CtpoSubjects />} />
            <Route path="/ctpo/marks" element={<CtpoMarkEntry />} />
            <Route path="/ctpo/results" element={<CtpoResults />} />
            <Route path="/ctpo/backlogs" element={<CtpoBacklogs />} />
            <Route path="/ctpo/notices" element={<CtpoNotices />} />
            <Route path="/ctpo/at-risk" element={<Navigate to="/ctpo/students?risk=AT-RISK" replace />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['HOD']} />}>
            <Route path="/hod/dashboard" element={<HodDashboard />} />
            <Route path="/hod/performance" element={<HodPerformance />} />
            <Route path="/hod/results" element={<HodResults />} />
            <Route path="/hod/backlogs" element={<HodBacklogs />} />
            <Route path="/hod/risk" element={<HodRisk />} />
            <Route path="/hod/remedial" element={<HodRemedial />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['PRINCIPAL']} />}>
            <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
            <Route path="/principal/campus-overview" element={<PrincipalCampusOverview />} />
            <Route path="/principal/branches" element={<PrincipalBranches />} />
            <Route path="/principal/years" element={<PrincipalYears />} />
            <Route path="/principal/drill-down" element={<PrincipalDrillDown />} />
            <Route path="/principal/backlogs" element={<PrincipalBacklogs />} />
            <Route path="/principal/risk" element={<PrincipalRisk />} />
            <Route path="/principal/remedial" element={<PrincipalRemedial />} />
            <Route path="/principal/guest-lectures" element={<PrincipalGuestLectures />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['COORDINATOR']} />}>
            <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />
            <Route path="/coordinator/remedial-classes" element={<CoordinatorRemedialClasses />} />
            <Route path="/coordinator/backlog-students" element={<CoordinatorBacklogStudents />} />
            <Route path="/coordinator/attendance" element={<CoordinatorAttendanceProgress />} />
            <Route path="/coordinator/guest-lectures" element={<CoordinatorGuestLectures />} />
            <Route path="/coordinator/notifications" element={<CoordinatorNotifications />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/import" element={<AdminResultImport />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/roles-access" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/sections" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/campus" element={<AdminCampus />} />
            <Route path="/admin/branches" element={<AdminBranches />} />
            <Route path="/admin/campus-branch-link" element={<AdminCampusBranchLink />} />
            <Route path="/admin/academic-years" element={<AdminAcademicYears />} />
            <Route path="/admin/semesters" element={<AdminSemesters />} />
            <Route path="/admin/sections" element={<AdminSections />} />
            <Route path="/admin/subjects" element={<AdminSubjects />} />
            <Route path="/admin/system-config" element={<AdminSystemConfiguration />} />
            <Route path="/admin/notices" element={<AdminNotices />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
