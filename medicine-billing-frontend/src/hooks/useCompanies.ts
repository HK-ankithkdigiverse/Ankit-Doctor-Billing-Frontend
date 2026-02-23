import { useQuery, useMutation, useQueryClient,keepPreviousData } from "@tanstack/react-query";
import {
  getCompaniesApi,
  createCompanyApi,
  updateCompanyApi,
  deleteCompanyApi,
} from "../api/companyApi";
import { QUERY_KEYS } from "../constants";

/* -------- GET -------- */
export const useCompanies = (
  page: number,
  limit: number,
  search: string
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANIES });
    },
  });
};

/* -------- DELETE -------- */
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompanyApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPANIES });
    },
  });
};
