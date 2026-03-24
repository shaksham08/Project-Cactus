/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, loginUser, registerUser } from "../lib/api/auth";
import { TOKEN_KEY, getErrorMessage } from "../lib/api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const setSession = (payload) => {
    localStorage.setItem(TOKEN_KEY, payload.token);
    setUser(payload.user);
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const login = async (credentials) => {
    const payload = await loginUser(credentials);
    setSession(payload);
    return payload.user;
  };

  const register = async (form) => {
    const payload = await registerUser(form);
    setSession(payload);
    return payload.user;
  };

  const refreshProfile = async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      clearSession();
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const profile = await getProfile();
        setUser(profile);
      } catch {
        clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isBootstrapping,
    login,
    register,
    logout: clearSession,
    refreshProfile,
    getErrorMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
