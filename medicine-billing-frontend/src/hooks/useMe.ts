import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios";
import { AUTH_API, QUERY_KEYS, STORAGE_KEYS } from "../constants";

export const useMe = () => {
  const token =
    localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem("token");

  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: async () => {
      try {
        const res = await api.get(AUTH_API.ME);
        const payload = res.data as any;
        // Support both response shapes: { ...user } and { user: {...user} }
        return payload?.user ?? payload;
      } catch {
        return null;
      }
    },
    enabled: Boolean(token),
    retry: false,
    initialData: null,
  });
};
