import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { AuthContext } from "./authContext";

function getUser(response) {
  return response?.data?.data?.user || response?.data?.data || response?.data?.user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshUser() {
    try {
      const response = await api.get("/api/auth/me");
      const authenticatedUser = getUser(response);
      setUser(authenticatedUser || null);
      return authenticatedUser;
    } catch (error) {
      if (error?.response?.status === 401) setUser(null);
      throw error;
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const response = await api.get("/api/auth/me");
        if (isMounted) setUser(getUser(response) || null);
      } catch (error) {
        if (isMounted && error?.response?.status === 401) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initializeAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  async function login(credentials) {
    const response = await api.post("/api/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });
    const authenticatedUser = getUser(response);
    setUser(authenticatedUser || null);
    return response;
  }

  async function signup(formData) {
    const response = await api.post("/api/auth/signup", {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone_no: formData.phone_no,
    });
    const authenticatedUser = getUser(response);
    setUser(authenticatedUser || null);
    return response;
  }

  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      refreshUser,
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}