import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, getMe } from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Optionally verify with server
          const meRes = await getMe();
          if (meRes.success && meRes.data?.user) {
            setUser(meRes.data.user);
            localStorage.setItem("user", JSON.stringify(meRes.data.user));
          }
        } catch (err) {
          console.warn("Auth initialization token check failed:", err.message);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    if (res.success && res.data) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(receivedUser));
      return { success: true, user: receivedUser };
    }
    throw new Error(res.message || "Login failed");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const getDashboardRoute = (role = user?.role) => {
    switch (role) {
      case "CTPO":
        return "/ctpo/dashboard";
      case "STUDENT":
        return "/student/dashboard";
      case "HOD":
        return "/hod/dashboard";
      case "PRINCIPAL":
        return "/principal/dashboard";
      case "COORDINATOR":
        return "/coordinator/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
