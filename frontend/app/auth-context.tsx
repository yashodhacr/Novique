"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authApi from "@/lib/auth";

interface AuthState {
  token: string | null;
  user: authApi.User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = "ap_token";
const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<authApi.User | null>(null);
  const [ready, setReady] = useState(false);

  // Rehydrate from localStorage on first load.
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setReady(true);
      return;
    }
    setToken(stored);
    authApi
      .getMe(stored)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  const finish = useCallback(async (tp: authApi.TokenPair) => {
    localStorage.setItem(TOKEN_KEY, tp.access_token);
    setToken(tp.access_token);
    setUser(await authApi.getMe(tp.access_token));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => finish(await authApi.login(email, password)),
    [finish],
  );
  const register = useCallback(
    async (email: string, password: string) => finish(await authApi.register(email, password)),
    [finish],
  );
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ token, user, ready, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
