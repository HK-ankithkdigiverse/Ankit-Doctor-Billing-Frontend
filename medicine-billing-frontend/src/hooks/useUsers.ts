import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsersApi, updateUserApi, createUserApi, deleteUserApi } from "../api/userApi";
import { useMe } from "./useMe";
import { QUERY_KEYS } from "../constants";

export const useUsers = (
  page: number,
  limit: number,
  search: string,
  status?: "all" | "active" | "inactive"
) => {
  const { data: me } = useMe();

  return useQuery({
    queryKey: QUERY_KEYS.USERS_LIST({ page, limit, search, status }),
    queryFn: () =>
      getAllUsersApi({
        page,
        limit,
        search: search || undefined,
        isActive: status === "all" || !status ? undefined : status === "active",
      }),
    enabled: me?.role === "ADMIN",
    placeholderData: (prev) => prev,
    staleTime: 1000 * 5,
  });
};
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
};
