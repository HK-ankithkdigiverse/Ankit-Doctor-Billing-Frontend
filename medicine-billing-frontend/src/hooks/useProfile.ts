import { useQuery,useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfileApi, updateProfileApi, deleteAccountApi, changePasswordApi } from "../api/userApi";
import { QUERY_KEYS, STORAGE_KEYS } from "../constants";



export const useProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: getProfileApi,
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

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccountApi,
    onSuccess: () => {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem("token");
      queryClient.clear();
      window.location.href = "/";
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
