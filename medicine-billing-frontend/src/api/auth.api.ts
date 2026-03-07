import { api } from "./axios";
import { AUTH_API } from "../constants";
import type {
  LoginPayload,
  VerifyOtpPayload,
  LoginResponse,
  VerifyOtpResponse,
} from "../types";

export const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>(AUTH_API.LOGIN, payload);
  return data;
};

export const verifyOtpApi = async (
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> => {
  const { data } = await api.post<VerifyOtpResponse>(AUTH_API.VERIFY_OTP, payload);
  return data;
};

export const logoutApi = async () => {
  const { data } = await api.post(AUTH_API.LOGOUT);
  return data;
};

export const forgotPasswordApi = async ({ email }: { email: string }) => {
  const { data } = await api.post(AUTH_API.FORGOT_PASSWORD, { email });
  return data;
};

export const resetPasswordApi = async (payload: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const { data } = await api.post(AUTH_API.RESET_PASSWORD, payload);
  return data;
};
