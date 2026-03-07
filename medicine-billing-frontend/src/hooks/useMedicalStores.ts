import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createMedicalStoreApi,
  deleteMedicalStoreApi,
  getAllMedicalStoresApi,
  getMedicalStoreByIdApi,
  getMedicalStoresApi,
  updateMedicalStoreApi,
} from "../api/resourceApi";
import { QUERY_KEYS } from "../constants/queryKeys";
import { useMe } from "./useMe";
import { invalidateQueryKeys, parsePaginatedListArgs } from "./queryHelpers";

type MedicalStoresQueryOptions = {
  enabled?: boolean;
};

export const useMedicalStores = (
  page?: number,
  limitOrSearch?: number | string,
  searchOrOptions: string | MedicalStoresQueryOptions = "",
  optionsArg?: MedicalStoresQueryOptions
) => {
  const { data: me } = useMe();
  const { isPaginated, limit, search, options } = parsePaginatedListArgs(
    page,
    limitOrSearch,
    searchOrOptions,
    optionsArg
  );
  const pageNumber = typeof page === "number" ? page : 1;

  return useQuery({
    queryKey: isPaginated
      ? [QUERY_KEYS.MEDICAL_STORES, pageNumber, limit, search]
      : [QUERY_KEYS.MEDICAL_STORES, "all"],
    queryFn: () =>
      isPaginated
        ? getMedicalStoresApi({
            page: pageNumber,
            limit,
            search: search || undefined,
          })
        : getAllMedicalStoresApi(),
    enabled: (options?.enabled ?? true) && me?.role === "ADMIN",
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllMedicalStores = (options?: MedicalStoresQueryOptions) => {
  const { data: me } = useMe();

  return useQuery({
    queryKey: [QUERY_KEYS.MEDICAL_STORES, "all"],
    queryFn: () => getAllMedicalStoresApi(),
    enabled: (options?.enabled ?? true) && me?.role === "ADMIN",
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMedicalStore = (id?: string) => {
  const { data: me } = useMe();

  return useQuery({
    queryKey: [QUERY_KEYS.MEDICAL_STORE, id],
    queryFn: async () => {
      const payload = await getMedicalStoreByIdApi(id as string);
      return (payload as any)?.medicalStore ?? payload;
    },
    enabled: Boolean(id) && me?.role === "ADMIN",
  });
};

export const useCreateMedicalStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMedicalStoreApi,
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [QUERY_KEYS.MEDICAL_STORES]);
    },
  });
};

export const useUpdateMedicalStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMedicalStoreApi,
    onSuccess: (_, variables) => {
      invalidateQueryKeys(
        queryClient,
        [QUERY_KEYS.MEDICAL_STORES],
        [QUERY_KEYS.MEDICAL_STORE, variables.id]
      );
    },
  });
};

export const useDeleteMedicalStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedicalStoreApi,
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [QUERY_KEYS.MEDICAL_STORES]);
    },
  });
};
