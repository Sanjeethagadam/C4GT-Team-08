import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout & Route Protection
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// CTPO Pages
import CTPODashboard from './pages/ctpo/CTPODashboard';
import CTPOStudentsPage from './pages/ctpo/CTPOStudentsPage';
import CTPOMidMarksPage from './pages/ctpo/CTPOMidMarksPage';
import CTPOTimetablePage from './pages/ctpo/CTPOTimetablePage';
import CTPORiskAnalysisPage from './pages/ctpo/CTPORiskAnalysisPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentMidMarksPage from './pages/student/StudentMidMarksPage';
import StudentTimetablePage from './pages/student/StudentTimetablePage';
import StudentBacklogsPage from './pages/student/StudentBacklogsPage';

// Institutional Dashboards
import AdminDashboard from './pages/roles/AdminDashboard';
import HODDashboard from './pages/roles/HODDashboard';
import PrincipalDashboard from './pages/roles/PrincipalDashboard';
import CoordinatorDashboard from './pages/roles/CoordinatorDashboard';

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'CTPO':
      return <Navigate to="/ctpo/dashboard" replace />;
    case 'STUDENT':
      return <Navigate to="/student/dashboard" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'HOD':
      return <Navigate to="/hod/dashboard" replace />;
    case 'PRINCIPAL':
      return <Navigate to="/principal/dashboard" replace />;
    case 'COORDINATOR':
      return <Navigate to="/coordinator/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* CTPO Protected Routes */}
      <Route
        path="/ctpo"
        element={
          <ProtectedRoute allowedRoles={['CTPO']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CTPODashboard />} />
        <Route path="students" element={<CTPOStudentsPage />} />
        <Route path="mid-marks" element={<CTPOMidMarksPage />} />
        <Route path="timetable" element={<CTPOTimetablePage />} />
        <Route path="risk-analysis" element={<CTPORiskAnalysisPage />} />
      </Route>

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="mid-marks" element={<StudentMidMarksPage />} />
        <Route path="timetable" element={<StudentTimetablePage />} />
        <Route path="backlogs" element={<StudentBacklogsPage />} />
      </Route>

      {/* ADMIN Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      {/* HOD Protected Routes */}
      <Route
        path="/hod"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HODDashboard />} />
      </Route>

      {/* PRINCIPAL Protected Routes */}
      <Route
        path="/principal"
        element={
          <ProtectedRoute allowedRoles={['PRINCIPAL']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PrincipalDashboard />} />
      </Route>

      {/* COORDINATOR Protected Routes */}
      <Route
        path="/coordinator"
        element={
          <ProtectedRoute allowedRoles={['COORDINATOR']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CoordinatorDashboard />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
