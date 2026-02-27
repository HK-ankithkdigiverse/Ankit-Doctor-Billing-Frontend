// ===================== auth.api.ts =====================
import { api } from "./axios";
import { dataOf } from "./http";
import type {
  LoginPayload,
  VerifyOtpPayload,
  LoginResponse,
  VerifyOtpResponse,
} from "../types";
import { AUTH_API } from "../constants";

export const loginApi = (data: LoginPayload) => dataOf(api.post<LoginResponse>(AUTH_API.LOGIN, data));

export const verifyOtpApi = (data: VerifyOtpPayload) =>
  dataOf(api.post<VerifyOtpResponse>(AUTH_API.VERIFY_OTP, data));

export const logoutApi = () => dataOf(api.post(AUTH_API.LOGOUT));

export const forgotPasswordApi = ({ email }: { email: string }) =>
  dataOf(api.post(AUTH_API.FORGOT_PASSWORD, { email }));

export const resetPasswordApi = async ({
  email,
  otp,
  newPassword,
}: {
  email: string;
  otp: string;
  newPassword: string;
}) => dataOf(api.post(AUTH_API.RESET_PASSWORD, { email, otp, newPassword }));
