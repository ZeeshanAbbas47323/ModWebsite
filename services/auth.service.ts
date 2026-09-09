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

  otpRequired: boolean;
}


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
      user_type: "customer",
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


  sendOtp: async (email: string): Promise<void> => {
    await apiClient.post("/auth/send-otp", { email });
  },


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


  forgotPassword: async (email: string): Promise<string> => {
    const { data } = await apiClient.post("/auth/forgot-password", { email });
    return (data?.message as string) ?? "Check your email for the reset code.";
  },

  verifyResetOtp: async (email: string, otp: string): Promise<void> => {
    await apiClient.post("/auth/verify-reset-otp", { email, otp });
  },

  resetPassword: async (input: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<string> => {
    const { data } = await apiClient.post("/auth/reset-password", input);
    return (data?.message as string) ?? "Password updated. You can sign in now.";
  },
};
