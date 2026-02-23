// src/api/axios.ts
import axios from "axios";
import { AUTH_API } from "../constants";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");


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

api.interceptors.response.use((response) => {
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
});
