import { apiRequest } from "./http";

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { email: string; password: string; name: string };

export type AuthTokenResponse = {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type ForgotPasswordRequest = { email: string };
export type ResetPasswordRequest = { token: string; newPassword: string };

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type UserResponse = {
  id?: number;
  name?: string;
  email: string;
};

export const authApi = {
  login: (req: LoginRequest) =>
    apiRequest<AuthTokenResponse>("/auth/login", "POST", req, { includeAuth: false }),

  register: (req: RegisterRequest) =>
    apiRequest<void>("/auth/register", "POST", req, { includeAuth: false }),

  refresh: (req: RefreshTokenRequest) =>
    apiRequest<AuthTokenResponse>("/auth/refresh", "POST", req, { includeAuth: false }),

  forgotPassword: (req: ForgotPasswordRequest) =>
    apiRequest<void>("/auth/forgot-password", "POST", req, {
      includeAuth: false,
    }),

  resetPassword: (req: ResetPasswordRequest) =>
    apiRequest<void>("/auth/reset-password", "POST", req, {
      includeAuth: false,
    }),

  changePassword: (req: ChangePasswordRequest) =>
    apiRequest<void>("/me/password", "PUT", req),

  getMe: () =>
    apiRequest<UserResponse>("/me", "GET"),
};
