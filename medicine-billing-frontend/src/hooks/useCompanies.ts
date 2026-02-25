import { useQuery, useMutation, useQueryClient,keepPreviousData } from "@tanstack/react-query";
import {
  getCompaniesApi,
  getCompanyByIdApi,
  createCompanyApi,
  updateCompanyApi,
  deleteCompanyApi,
} from "../api/companyApi";
import { QUERY_KEYS } from "../constants";

const isValidObjectId = (id?: string) => !!id && /^[a-fA-F0-9]{24}$/.test(id);

/* -------- GET -------- */
export const useCompanies = (
  page: number,
  limit: number,
  search: string,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: QUERY_KEYS.COMPANIES_LIST({ page, limit, search }),

    queryFn: () =>
      getCompaniesApi({
        page,
        limit,
        search: search || undefined,
      }),

    // ✅ v5 correct replacement of keepPreviousData
    placeholderData: keepPreviousData,

    staleTime: 1000 * 5,
    enabled: options?.enabled ?? true,
  });
};

export const useCompany = (id?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.COMPANY(id || ""),
    queryFn: async () => {
      const payload = await getCompanyByIdApi(id as string);
      return (payload as any)?.company ?? payload;
    },
    enabled: isValidObjectId(id),
  });
};

/* -------- CREATE -------- */
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompanyApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANIES });
    },
  });
};

/* -------- UPDATE -------- */
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanyApi,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANY(variables.id) });
    },
  });
};

/* -------- DELETE -------- */
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompanyApi,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANY(id) });
    },
  });
};
