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

/** What the caller must do next after submitting credentials. */
export type AuthStep = "authenticated" | "otp_required";

interface AuthContextValue {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  /** Set while an OTP is outstanding, so the UI knows which email to verify. */
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
  // Guards against rendering auth-dependent UI before localStorage is read,
  // which would otherwise flash the logged-out state on every page load.
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // localStorage is client-only, so the session must be restored after the
    // first paint — reading it during render would break SSR hydration.
    const token = getToken();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) setUser(getStoredUser());
     
    setIsReady(true);
  }, []);

  /** Persist a successful sign-in, or hold the email for the OTP step. */
  const applyResult = useCallback(
    async (result: AuthResult, email: string): Promise<AuthStep> => {
      if (!result.token) {
        setPendingEmail(email);
        return "otp_required";
      }
      setToken(result.token);

      // Some responses omit the user object; fall back to the profile call so
      // the account page and checkout always have a name to work with.
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
      // Registration did not issue a session, so sign in with the new details.
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
      // Even if the API call fails the local session must go.
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
