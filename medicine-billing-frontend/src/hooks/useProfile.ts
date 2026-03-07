import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changePasswordApi, getProfileApi, updateProfileApi } from "../api/userApi";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getStoredToken } from "../utils/tokenStorage";
import { invalidateQueryKeys } from "./queryHelpers";

export const useProfile = () => {
  const token = getStoredToken();

  return useQuery({
    queryKey: [QUERY_KEYS.PROFILE],
    queryFn: getProfileApi,
    enabled: Boolean(token),
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [QUERY_KEYS.PROFILE]);
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [QUERY_KEYS.PROFILE]);
    },
  });
};
