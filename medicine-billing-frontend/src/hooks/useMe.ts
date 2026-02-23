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
        return res.data;
      } catch {
        return null; 
      }
    },
    enabled: !!token,
    retry: false,
  });
};
