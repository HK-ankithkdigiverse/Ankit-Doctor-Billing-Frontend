import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCompanyApi,
  deleteCompanyApi,
  getAllCompaniesApi,
  getCompaniesApi,
  getCompanyByIdApi,
  updateCompanyApi,
} from "../api/companyApi";
import { QUERY_KEYS } from "../constants/queryKeys";
import { isObjectId } from "../utils/common";

type CompaniesQueryOptions = { enabled?: boolean };
type AllCompaniesOptions = { enabled?: boolean; medicalStoreId?: string };

export const useCompanies = (
  page?: number,
  limitOrSearch?: number | string,
  searchOrOptions: string | CompaniesQueryOptions = "",
  optionsArg?: CompaniesQueryOptions
) => {
  const isPaginated = typeof page === "number";
  const limit = typeof limitOrSearch === "number" ? limitOrSearch : undefined;
  const search =
    typeof limitOrSearch === "string"
      ? limitOrSearch
      : typeof searchOrOptions === "string"
        ? searchOrOptions
        : "";
  const options = typeof searchOrOptions === "object" ? searchOrOptions : optionsArg;

  return useQuery({
    queryKey: isPaginated
      ? [QUERY_KEYS.COMPANIES, page, limit, search]
      : [QUERY_KEYS.COMPANIES, "all"],
    queryFn: () =>
      isPaginated
        ? getCompaniesApi({
            page,
            limit,
            search: search || undefined,
          })
        : getAllCompaniesApi(),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllCompanies = (options?: AllCompaniesOptions) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COMPANIES, "all", options?.medicalStoreId],
    queryFn: () =>
      getAllCompaniesApi({
        medicalStoreId: options?.medicalStoreId,
      }),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCompany = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COMPANY, id],
    queryFn: async () => {
      const payload = await getCompanyByIdApi(id as string);
      return (payload as any)?.company ?? payload;
    },
    enabled: isObjectId(id),
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompanyApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMPANIES] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
      updateCompanyApi(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMPANIES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMPANY, variables.id] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompanyApi,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMPANIES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMPANY, id] });
    },
  });
};
