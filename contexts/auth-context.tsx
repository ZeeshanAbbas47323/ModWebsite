"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  authService,
  type AuthResult,
  type LoginInput,
  type RegisterInput,
} from "@/services/auth.service";
import {
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
  type StoredUser,
} from "@/lib/auth-storage";


export type AuthStep = "authenticated" | "otp_required";

interface AuthContextValue {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isReady: boolean;

  pendingEmail: string | null;
  login: (input: LoginInput) => Promise<AuthStep>;
  register: (input: RegisterInput) => Promise<AuthStep>;
  verifyOtp: (otp: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  cancelOtp: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);


  const [isReady, setIsReady] = useState(false);

  useEffect(() => {


    const token = getToken();

    if (token) setUser(getStoredUser());

    setIsReady(true);
  }, []);


  const applyResult = useCallback(
    async (result: AuthResult, email: string): Promise<AuthStep> => {
      if (!result.token) {
        setPendingEmail(email);
        return "otp_required";
      }
      setToken(result.token);

      let account = result.user;
      if (!account) {
        try {
          account = await authService.profile();
        } catch {
          account = { id: 0, email };
        }
      }
      setStoredUser(account);
      setUser(account);
      setPendingEmail(null);
      return "authenticated";
    },
    []
  );

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await authService.login(input);
      return applyResult(result, input.email);
    },
    [applyResult]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await authService.register(input);
      if (result.token) return applyResult(result, input.email);

      const loginResult = await authService.login({
        email: input.email,
        password: input.password,
      });
      return applyResult(loginResult, input.email);
    },
    [applyResult]
  );

  const verifyOtp = useCallback(
    async (otp: string) => {
      if (!pendingEmail) throw new Error("No sign-in is waiting for a code.");
      const result = await authService.verifyOtp(pendingEmail, otp);
      const step = await applyResult(result, pendingEmail);
      if (step !== "authenticated") {
        throw new Error("The code was accepted but no session was returned.");
      }
    },
    [pendingEmail, applyResult]
  );

  const resendOtp = useCallback(async () => {
    if (!pendingEmail) return;
    await authService.sendOtp(pendingEmail);
  }, [pendingEmail]);

  const cancelOtp = useCallback(() => setPendingEmail(null), []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    }
    clearAuth();
    setUser(null);
    setPendingEmail(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isReady,
      pendingEmail,
      login,
      register,
      verifyOtp,
      resendOtp,
      cancelOtp,
      logout,
    }),
    [user, isReady, pendingEmail, login, register, verifyOtp, resendOtp, cancelOtp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
