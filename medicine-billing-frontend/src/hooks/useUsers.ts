import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createUserApi,
  deleteUserApi,
  getAllUsersApi,
  getUsersApi,
  type UpdateUserPayload,
  updateUserApi,
} from "../api/userApi";
import { QUERY_KEYS } from "../constants/queryKeys";
import { useMe } from "./useMe";
import { invalidateQueryKeys } from "./queryHelpers";

type UserStatus = "all" | "active" | "inactive";
type UsersQueryOptions = { enabled?: boolean; sortBy?: string; sortOrder?: "asc" | "desc" };

const isUserStatus = (value: unknown): value is UserStatus =>
  value === "all" || value === "active" || value === "inactive";

const isUsersQueryOptions = (value: unknown): value is UsersQueryOptions =>
  typeof value === "object" && value !== null;

export const useUsers = (
  page?: number,
  limitOrSearch?: number | string,
  searchOrStatusOrOptions: string | UserStatus | UsersQueryOptions = "",
  statusOrOptions?: UserStatus | UsersQueryOptions,
  optionsArg?: UsersQueryOptions
) => {
  const { data: me } = useMe();
  const isAdmin = me?.role === "ADMIN";
  const isPaginated = typeof page === "number";

  const limit = typeof limitOrSearch === "number" ? limitOrSearch : undefined;
  const search =
    typeof limitOrSearch === "string"
      ? limitOrSearch
      : typeof searchOrStatusOrOptions === "string" && !isUserStatus(searchOrStatusOrOptions)
        ? searchOrStatusOrOptions
        : "";

  let status: UserStatus | undefined;
  if (typeof limitOrSearch === "string" && isUserStatus(searchOrStatusOrOptions)) {
    status = searchOrStatusOrOptions;
  }
  if (isUserStatus(statusOrOptions)) {
    status = statusOrOptions;
  }

  const options = isUsersQueryOptions(searchOrStatusOrOptions)
    ? searchOrStatusOrOptions
    : isUsersQueryOptions(statusOrOptions)
      ? statusOrOptions
      : optionsArg;

  return useQuery({
    queryKey: isPaginated
      ? [QUERY_KEYS.USERS, page, limit, search, status]
      : [QUERY_KEYS.USERS, "all", status],
    queryFn: () =>
      isPaginated
        ? getUsersApi({
            page,
            limit,
            search: search || undefined,
            isActive: status === "all" || !status ? undefined : status === "active",
            sortBy: options?.sortBy,
            sortOrder: options?.sortOrder,
          })
        : getAllUsersApi({
      
          }),
    enabled: (options?.enabled ?? true) && isAdmin,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllUsers = (status: UserStatus = "all", options?: UsersQueryOptions) => {
  const { data: me } = useMe();
  const isAdmin = me?.role === "ADMIN";

  return useQuery({
    queryKey: [QUERY_KEYS.USERS, "all", status],
    queryFn: () =>
      getAllUsersApi({
        isActive: status === "all" ? undefined : status === "active",
      }),
    enabled: (options?.enabled ?? true) && isAdmin,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: UpdateUserPayload }>({
    mutationFn: ({ id, data }) => updateUserApi(id, data),
    onSuccess: () => {
      invalidateQueryKeys(
        queryClient,
        [QUERY_KEYS.USERS],
        [QUERY_KEYS.MEDICAL_STORES]
      );
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      invalidateQueryKeys(
        queryClient,
        [QUERY_KEYS.USERS],
        [QUERY_KEYS.MEDICAL_STORES]
      );
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [QUERY_KEYS.USERS]);
    },
  });
};
