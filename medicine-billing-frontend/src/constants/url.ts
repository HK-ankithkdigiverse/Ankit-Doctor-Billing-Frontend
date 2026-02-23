export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
};

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
