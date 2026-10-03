import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "@/services/authService";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from local storage
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        const storedToken = sessionStorage.getItem("token");
        const storedUser = sessionStorage.getItem("user");
        if (storedToken && storedUser) {
          // validate with backend
          const response = await authService.validateToken();
          if (!mounted) return;

          setToken(storedToken);
          // Prefer fresh user from backend if available, else from storage
          if (response?.user) {
            setUser(response.user);
            sessionStorage.setItem("user", JSON.stringify(response.user));
          } else {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (e) {
        console.error("Token validation failed", e);
        // Validation failed, clear stale data
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();
    
    const handleProfileUpdate = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse updated user from storage", e);
        }
      }
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    
    return () => {
      mounted = false;
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setToken(data.token);
    setUser(data.user);
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));
  }, []);

  const logout = useCallback(() => {
    if (user?.username) {
      void authService.logout(user.username).catch(() => undefined);
    }
    setToken(null);
    setUser(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }, [user]);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
