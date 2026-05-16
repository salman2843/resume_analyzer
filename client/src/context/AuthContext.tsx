import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentUser, login, register } from "../services/auth";
import type { LoginInput, RegisterInput, User } from "../services/auth";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  loginUser: (input: LoginInput) => Promise<void>;
  registerUser: (input: RegisterInput) => Promise<void>;
  logoutUser: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => localStorage.removeItem("auth_token"))
      .finally(() => setIsLoading(false));
  }, []);

  async function loginUser(input: LoginInput) {
    const response = await login(input);
    localStorage.setItem("auth_token", response.token);
    setUser(response.user);
  }

  async function registerUser(input: RegisterInput) {
    const response = await register(input);
    localStorage.setItem("auth_token", response.token);
    setUser(response.user);
  }

  function logoutUser() {
    localStorage.removeItem("auth_token");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, isLoading, loginUser, registerUser, logoutUser }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
