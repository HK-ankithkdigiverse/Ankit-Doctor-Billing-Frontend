import axios from "axios";
import { API_BASE_URL, AUTH_API, STORAGE_KEYS } from "../constants";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem("token");

  if (!localStorage.getItem(STORAGE_KEYS.TOKEN) && token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  if (
    token &&
    !config.url?.includes(AUTH_API.LOGIN) &&
    !config.url?.includes(AUTH_API.SIGNUP) &&
    !config.url?.includes(AUTH_API.VERIFY_OTP)
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const payload = response.data;

    const isApiResponseShape =
      payload &&
      typeof payload === "object" &&
      "status" in payload &&
      "message" in payload &&
      ("data" in payload || "error" in payload);

    if (isApiResponseShape) {
      // Keep old frontend code working by exposing inner `data` directly when present.
      if (payload.data !== undefined && payload.data !== null) {
        response.data = payload.data;
      }
    }

    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);
