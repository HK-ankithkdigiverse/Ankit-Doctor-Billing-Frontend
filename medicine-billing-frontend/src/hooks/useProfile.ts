import { useQuery,useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfileApi, updateProfileApi, changePasswordApi } from "../modules/users/api";
import { QUERY_KEYS } from "../constants";
import { getStoredToken } from "../common/helpers/tokenStorage";



export const useProfile = () => {
  const token = getStoredToken();

  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: getProfileApi,
    enabled: Boolean(token),
    retry: false,
    initialData: null,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
    },
  });
};


