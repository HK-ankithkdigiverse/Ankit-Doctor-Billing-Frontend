import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMedicalStoreApi,
  deleteMedicalStoreApi,
  getMedicalStoreByIdApi,
  getMedicalStoresApi,
  updateMedicalStoreApi,
} from "../api/medicalStoreApi";
import { QUERY_KEYS } from "../constants";
import { useMe } from "./useMe";

export const useMedicalStores = (
  page: number,
  limit: number,
  search: string,
  options?: {
    enabled?: boolean;
  }
) => {
  const { data: me } = useMe();

  return useQuery({
    queryKey: QUERY_KEYS.MEDICAL_STORES_LIST({ page, limit, search }),
    queryFn: () =>
      getMedicalStoresApi({
        page,
        limit,
        search: search || undefined,
      }),
    enabled: (options?.enabled ?? true) && me?.role === "ADMIN",
    placeholderData: (prev) => prev,
    staleTime: 1000 * 5,
  });
};

export const useMedicalStore = (id?: string) => {
  const { data: me } = useMe();

  return useQuery({
    queryKey: QUERY_KEYS.MEDICAL_STORE(id || ""),
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEDICAL_STORES });
    },
  });
};

export const useUpdateMedicalStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMedicalStoreApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEDICAL_STORES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEDICAL_STORE(variables.id) });
    },
  });
};

export const useDeleteMedicalStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedicalStoreApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEDICAL_STORES });
    },
  });
};


