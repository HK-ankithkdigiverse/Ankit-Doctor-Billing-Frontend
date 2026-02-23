// ===================== auth.api.ts =====================
import { api } from "./axios";
import type {
  LoginPayload,
  VerifyOtpPayload,
  LoginResponse,
  VerifyOtpResponse,
} from "../types";
import { AUTH_API } from "../constants";

export const loginApi = async (data: LoginPayload) => {
  const res = await api.post<LoginResponse>(AUTH_API.LOGIN, data);
  return res.data;
};

export const verifyOtpApi = async (data: VerifyOtpPayload) => {
  const res = await api.post<VerifyOtpResponse>(AUTH_API.VERIFY_OTP, data);
  return res.data;
};

export const logoutApi = async () => {
  const res = await api.post(AUTH_API.LOGOUT);
  return res.data;
};

export const forgotPasswordApi = async ({ email }: { email: string }) => {
  const res = await api.post(AUTH_API.FORGOT_PASSWORD, { email });
  return res.data;
};

export const resetPasswordApi = async ({
  email,
  otp,
  newPassword,
}: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const res = await api.post(AUTH_API.RESET_PASSWORD, { email, otp, newPassword });
  return res.data;
};
