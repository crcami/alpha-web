import { apiRequest } from "./http";

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { email: string; password: string; name: string };

export type TokenResponse = {
  tokenType: string;
  accessToken: string;
  expiresInSeconds: number;
};

export type ForgotPasswordRequest = { email: string };
export type ResetPasswordRequest = { token: string; newPassword: string };

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export const authApi = {
  login: (req: LoginRequest) =>
    apiRequest<TokenResponse>("/auth/login", "POST", req, { includeAuth: false }),

  register: (req: RegisterRequest) =>
    apiRequest<void>("/auth/register", "POST", req, { includeAuth: false }),

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
};
