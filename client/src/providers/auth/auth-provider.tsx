"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

    const restoreSession = async () => {
      try {
        if (token) {
          const currentUser = await authApi.me();
          if (active) login(currentUser, token);
          return;
        }

        const session = await authApi.refresh();
        if (active) login(session.user, session.accessToken);
      } catch {
        try {
          const session = await authApi.refresh();
          if (active) login(session.user, session.accessToken);
        } catch {
          if (active) clearAuth();
        }
      } finally {
        if (active) setReady(true);
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, [clearAuth, login, token]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = useMemo(
    () => ({ user, token, isAuthenticated, login, logout, ready }),
    [user, token, isAuthenticated, login, logout, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
