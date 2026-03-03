import axios from "axios";
import { API_BASE_URL, AUTH_API, ROUTES } from "../constants";
import { clearStoredToken, getStoredToken } from "../helpers/tokenStorage";
import { isPublicPath, storePostLoginRedirect } from "../utils/authRedirect";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

const isAuthRequest = (url?: string) =>
  [AUTH_API.LOGIN, AUTH_API.SIGNUP, AUTH_API.VERIFY_OTP].some((path) => url?.includes(path));

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && !isAuthRequest(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === "object" && "status" in payload && "message" in payload) {
      if (payload.data !== undefined && payload.data !== null) {
        response.data = payload.data;
      }
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredToken();
      if (!isPublicPath(window.location.pathname)) {
        const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        storePostLoginRedirect(currentPath);
        window.location.replace(`${ROUTES.LOGIN}?reason=session-expired`);
      }
    }
    return Promise.reject(error);
  }
);
