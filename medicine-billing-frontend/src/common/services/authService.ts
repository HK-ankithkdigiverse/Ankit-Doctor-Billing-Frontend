import { api } from "./apiClient";
import { normalizeUser } from "../../modules/users/api";
import { AUTH_API } from "../../constants";
import type { User } from "../../types";

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const res = await api.get(AUTH_API.ME);
    const payload = res.data as any;
    const user = payload?.user ?? payload;
    return user ? normalizeUser(user) : null;
  } catch {
    return null;
  }
};


