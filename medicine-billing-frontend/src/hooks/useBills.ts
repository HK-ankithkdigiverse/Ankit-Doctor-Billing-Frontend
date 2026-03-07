import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createBillApi,
  deleteBillApi,
  getAllBillsApi,
  getBillByIdApi,
  getBillsApi,
  updateBillApi,
} from "../api/resourceApi";
import { QUERY_KEYS } from "../constants/queryKeys";
import { isObjectId } from "../utils/common";
import { invalidateQueryKeys, parsePaginatedListArgs } from "./queryHelpers";

type BillsQueryOptions = { enabled?: boolean };
type BillQueryOptions = { enabled?: boolean };
type AllBillsQueryOptions = { enabled?: boolean; medicalStoreId?: string };

export const useBills = (
  page?: number,
  limitOrSearch?: number | string,
  searchOrOptions: string | BillsQueryOptions = "",
  optionsArg?: BillsQueryOptions
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
      ? [QUERY_KEYS.BILLS, pageNumber, limit, search]
      : [QUERY_KEYS.BILLS, "all"],
    queryFn: () =>
      isPaginated
        ? getBillsApi({
            page: pageNumber,
            limit,
            search: search || undefined,
          })
        : getAllBillsApi(),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllBills = (options?: AllBillsQueryOptions) =>
  useQuery({
    queryKey: [QUERY_KEYS.BILLS, "all", options?.medicalStoreId],
    queryFn: () =>
      getAllBillsApi({
        medicalStoreId: options?.medicalStoreId,
      }),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

export const useBill = (id?: string, options?: BillQueryOptions) =>
  useQuery({
    queryKey: [QUERY_KEYS.BILL, id],
    queryFn: () => getBillByIdApi(id as string),
    enabled: (options?.enabled ?? true) && isObjectId(id),
    retry: 0,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useCreateBill = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createBillApi,
    onSuccess: () => {
      invalidateQueryKeys(qc, [QUERY_KEYS.BILLS]);
    },
    onError: (err: any) => {
      console.error("Create Bill Error", err?.response?.data || err);
    },
  });
};

export const useDeleteBill = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteBillApi,
    onSuccess: () => {
      invalidateQueryKeys(qc, [QUERY_KEYS.BILLS]);
    },
  });
};

export const useUpdateBill = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateBillApi,
    onSuccess: (_, variables) => {
      invalidateQueryKeys(qc, [QUERY_KEYS.BILLS], [QUERY_KEYS.BILL, variables.id]);
    },
  });
};
