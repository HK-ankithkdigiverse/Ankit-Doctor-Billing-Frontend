import { getProfileApi } from "../api/userApi";
import type { User } from "../types";

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    return await getProfileApi();
  } catch {
    return null;
  }
};
