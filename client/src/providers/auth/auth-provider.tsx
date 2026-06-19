"use client";

import { createContext, useContext, useMemo } from "react";
import { useAuthStore } from "@/store/auth";
import type { User } from "@/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const value = useMemo(
    () => ({ user, token, isAuthenticated, login, logout }),
    [user, token, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
