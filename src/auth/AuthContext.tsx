import React, { createContext, useCallback, useMemo, useState } from "react";
import { clearToken, getToken, setToken } from "./tokenStorage";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  isAuthenticated: false,
  login: () => undefined,
  logout: () => undefined,
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

  const value = useMemo<AuthContextValue>(
    () => ({
      token: tokenState,
      isAuthenticated: Boolean(tokenState),
      login,
      logout,
    }),
    [login, logout, tokenState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
