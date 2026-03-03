import { STORAGE_KEYS } from "../constants";

export const getStoredToken = () =>
  localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem("token") || "";

export const setStoredToken = (token: string) => {
  if (!token) return;
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem("token", token);
};

export const clearStoredToken = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem("token");
};
