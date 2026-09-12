import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingState } from "../common/LoadingState";

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role, loading, getDashboardRoute } = useAuth();

  if (loading) {
    return <LoadingState message="Verifying authentication..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If role not authorized for this specific route, redirect to their own dashboard
    return <Navigate to={getDashboardRoute(role)} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
