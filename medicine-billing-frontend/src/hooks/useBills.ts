import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import {
  getBillsApi,
  getBillByIdApi,
  createBillApi,
  deleteBillApi,
  updateBillApi,
} from "../modules/billing/api";
import { QUERY_KEYS } from "../constants";

const isValidObjectId = (id?: string) => !!id && /^[a-fA-F0-9]{24}$/.test(id);

/* ======================
   LIST BILLS
====================== */
export const useBills = (
  page: number,
  limit: number,
  search: string
) =>
  useQuery({
    queryKey: QUERY_KEYS.BILLS_LIST({ page, limit, search }),
    queryFn: () =>
      getBillsApi({
        page,
        limit,
        search,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 5, // ✅ optional but recommended
  });

/* ======================
   SINGLE BILL
====================== */
export const useBill = (id?: string) =>
  useQuery({
    queryKey: QUERY_KEYS.BILL(id || ""),
    queryFn: () => getBillByIdApi(id as string),
    enabled: isValidObjectId(id),
  });

/* ======================
   CREATE BILL
====================== */
export const useCreateBill = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createBillApi,

    onSuccess: () => {
      // ✅ refresh bill list
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.BILLS,
      });
    },

    onError: (err: any) => {
      console.error("Create Bill Error 👉", err?.response?.data || err);
    },
  });
};

export const useDeleteBill = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteBillApi,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.BILLS,
      });
    },
  });
};

/* ======================
   UPDATE BILL
====================== */
export const useUpdateBill = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateBillApi,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILLS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BILL(variables.id) });
    },
  });
};


