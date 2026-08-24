import apiClient from "@/lib/axios";
import type { StoredUser } from "@/lib/auth-storage";

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResult {
  token: string;
  refreshToken?: string;
  user: StoredUser | null;
  /**
   * True when the account did not receive a token on sign-in and must complete
   * the emailed OTP step. Customer accounts normally get a token immediately;
   * staff accounts always go through the OTP.
   */
  otpRequired: boolean;
}

/**
 * The API returns tokens as `payload.tokens.{accessToken,refreshToken}`, but
 * older deployments used a flat `token`. Accept both.
 */
function extractAuth(raw: Record<string, unknown>): AuthResult {
  const body = (raw.payload ?? raw.data ?? raw) as Record<string, unknown>;
  const tokens = (body.tokens ?? {}) as Record<string, unknown>;

  const token =
    (tokens.accessToken as string) ??
    (tokens.access_token as string) ??
    (body.token as string) ??
    (body.accessToken as string) ??
    (raw.token as string) ??
    "";

  const refreshToken =
    (tokens.refreshToken as string) ?? (body.refreshToken as string) ?? undefined;

  const user = (body.user ?? body.customer ?? null) as StoredUser | null;

  return { token, refreshToken, user, otpRequired: !token };
}

export const authService = {
  login: async (input: LoginInput): Promise<AuthResult> => {
    const { data } = await apiClient.post("/auth/login", {
      rememberMe: true,
      ...input,
    });
    return extractAuth(data);
  },

  register: async (input: RegisterInput): Promise<AuthResult> => {
    const { data } = await apiClient.post("/auth/register", {
      ...input,
      role: "customer",
    });
    return extractAuth(data);
  },

  /** Re-send the sign-in OTP for accounts that require one. */
  sendOtp: async (email: string): Promise<void> => {
    await apiClient.post("/auth/send-otp", { email });
  },

  /** Exchange the emailed 6-digit code for a session token. */
  verifyOtp: async (email: string, otp: string): Promise<AuthResult> => {
    const { data } = await apiClient.post("/auth/verify-otp", { email, otp });
    return extractAuth(data);
  },

  profile: async (): Promise<StoredUser> => {
    const { data } = await apiClient.get("/auth/profile");
    return data.payload ?? data.data ?? data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout", {});
  },
};
