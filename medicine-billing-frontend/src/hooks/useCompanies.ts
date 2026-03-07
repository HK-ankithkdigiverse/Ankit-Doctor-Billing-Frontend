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
} from "../api/resourceApi";
import { QUERY_KEYS } from "../constants/queryKeys";
import { isObjectId } from "../utils/common";
import { invalidateQueryKeys, parsePaginatedListArgs } from "./queryHelpers";

type CompaniesQueryOptions = { enabled?: boolean };
type AllCompaniesOptions = { enabled?: boolean; medicalStoreId?: string };

export const useCompanies = (
  page?: number,
  limitOrSearch?: number | string,
  searchOrOptions: string | CompaniesQueryOptions = "",
  optionsArg?: CompaniesQueryOptions
) => {
  const { isPaginated, limit, search, options } = parsePaginatedListArgs(
    page,
    limitOrSearch,
    searchOrOptions,
    optionsArg
  );
  const pageNumber = typeof page === "number" ? page : 1;

  return useQuery({
    queryKey: isPaginated
      ? [QUERY_KEYS.COMPANIES, pageNumber, limit, search]
      : [QUERY_KEYS.COMPANIES, "all"],
    queryFn: () =>
      isPaginated
        ? getCompaniesApi({
            page: pageNumber,
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
      invalidateQueryKeys(queryClient, [QUERY_KEYS.COMPANIES]);
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
      updateCompanyApi(id, payload),
    onSuccess: (_data, variables) => {
      invalidateQueryKeys(
        queryClient,
        [QUERY_KEYS.COMPANIES],
        [QUERY_KEYS.COMPANY, variables.id]
      );
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompanyApi,
    onSuccess: (_data, id) => {
      invalidateQueryKeys(queryClient, [QUERY_KEYS.COMPANIES], [QUERY_KEYS.COMPANY, id]);
    },
  });
};
