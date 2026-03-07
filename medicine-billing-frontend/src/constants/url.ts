export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
  POST_LOGIN_REDIRECT: "post_login_redirect",
  THEME_MODE: "theme_mode",
};

const DEFAULT_API_ORIGIN = "https://ankit-doctor-billing-backend.vercel.app";
const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
const isAbsoluteApiUrl = /^https?:\/\//i.test(rawApiUrl);
const apiOriginFromEnv = isAbsoluteApiUrl ? rawApiUrl.replace(/\/api$/i, "") : "";

export const API_ORIGIN = apiOriginFromEnv || DEFAULT_API_ORIGIN;
// Always use same-origin API path so browser requests go through frontend rewrites/proxy.
// This avoids cross-origin preflight overhead from direct backend calls.
export const API_BASE_URL = "/api";

export const AUTH_API = {
  SIGNUP: "/auth/signup",
  LOGIN: "/auth/login",
  VERIFY_OTP: "/auth/verify-otp",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
};

export const USERS_API = {
  ROOT: "/users",
  BY_ID: (id: string) => `/users/${id}`,
  ME: "/users/me",
  ME_PASSWORD: "/users/me/password",
};

export const MEDICAL_STORES_API = {
  ROOT: "/medical-stores",
  BY_ID: (id: string) => `/medical-stores/${id}`,
};

export const PRODUCTS_API = {
  ROOT: "/products",
  BY_ID: (id: string) => `/products/${id}`,
};

export const COMPANIES_API = {
  ROOT: "/companies",
  BY_ID: (id: string) => `/companies/${id}`,
};

export const CATEGORIES_API = {
  ROOT: "/categories",
  BY_ID: (id: string) => `/categories/${id}`,
  DROPDOWN: "/categories/dropdown",
};

export const BILLS_API = {
  ROOT: "/bills",
  BY_ID: (id: string) => `/bills/${id}`,
};
