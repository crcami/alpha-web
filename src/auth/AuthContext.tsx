import React, { createContext, useCallback, useMemo, useState } from "react";
import { clearToken, getToken, setToken } from "./tokenStorage";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  isAuthenticated: false,
  userEmail: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokenState, setTokenState] = useState<string | null>(getToken());

  const login = useCallback((token: string) => {
    setToken(token);
    setTokenState(token);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, []);

  // Extract email from JWT token
  const userEmail = useMemo(() => {
    if (!tokenState) return null;
    try {
      const payload = JSON.parse(atob(tokenState.split(".")[1]));
      return payload.email || payload.sub || null;
    } catch {
      return null;
    }
  }, [tokenState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: tokenState,
      isAuthenticated: Boolean(tokenState),
      userEmail,
      login,
      logout,
    }),
    [login, logout, tokenState, userEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
