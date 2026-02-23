// src/api/axios.ts
import axios from "axios";
import { AUTH_API, STORAGE_KEYS } from "../constants";

const fallbackBaseUrl = "https://ankit-doctor-billing-backend.vercel.app/api";
const rawBaseUrl = (import.meta.env.VITE_API_URL || fallbackBaseUrl).trim();
const isLocalhostBaseUrl = /^https?:\/\/localhost(?::\d+)?(\/|$)/i.test(rawBaseUrl);
const effectiveBaseUrl = isLocalhostBaseUrl ? fallbackBaseUrl : rawBaseUrl;
const normalizedBaseUrl = rawBaseUrl
  .replace(/^https?:\/\/localhost(?::\d+)?/i, "https://ankit-doctor-billing-backend.vercel.app")
  .replace(/^ttps:\/\//, "https://")
  .replace(/\/+$/, "");

export const api = axios.create({
  baseURL: effectiveBaseUrl === rawBaseUrl ? normalizedBaseUrl : fallbackBaseUrl,
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
