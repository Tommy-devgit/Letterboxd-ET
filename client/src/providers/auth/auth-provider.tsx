"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { User } from "@/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated, login, logout: clearAuth } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    if (!hasSessionCookie()) {
      clearAuth();
      setReady(true);
      return () => {
        active = false;
      };
    }

    authApi
      .refresh()
      .then((session) => {
        if (active) login(session.user, session.accessToken);
      })
      .catch(() => {
        if (active && !token) clearAuth();
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated, login, logout, ready }),
    [user, token, isAuthenticated, login, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function hasSessionCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith("lbxd_et_session="));
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
