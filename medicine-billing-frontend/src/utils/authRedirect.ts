import { ROUTES, STORAGE_KEYS } from "../constants";

const PUBLIC_PATHS = new Set([
  ROUTES.LOGIN,
  "/login",
  ROUTES.VERIFY_OTP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
]);

export const isPublicPath = (pathname: string) => PUBLIC_PATHS.has(pathname);

const sanitizeRedirectPath = (value?: string | null) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return "";
  if (trimmed.startsWith("//")) return "";
  return trimmed;
};

export const storePostLoginRedirect = (path: string) => {
  const safe = sanitizeRedirectPath(path);
  if (!safe || isPublicPath(safe.split("?")[0])) return;
  localStorage.setItem(STORAGE_KEYS.POST_LOGIN_REDIRECT, safe);
};

export const readPostLoginRedirect = () =>
  sanitizeRedirectPath(localStorage.getItem(STORAGE_KEYS.POST_LOGIN_REDIRECT));

export const clearPostLoginRedirect = () =>
  localStorage.removeItem(STORAGE_KEYS.POST_LOGIN_REDIRECT);

