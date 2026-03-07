import { api } from "./axios";
import { buildPagedQueryParams, buildQueryParams, parseStatePagination } from "./pagination";
import { BILLS_API } from "../constants";
import type { BillPayload, BillUpdatePayload } from "../types/bill";
import type { ApiSortOrder } from "../types/api";

export type GetBillsParams = {
  page: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: ApiSortOrder;
  medicalStoreId?: string;
};

export type GetAllBillsParams = Omit<
  GetBillsParams,
  "page" | "limit" | "search" | "sortBy" | "sortOrder"
>;

const toBillsResponse = (raw: any) => {
  const bills = raw?.data || raw?.bills || raw?.bill_data || [];
  return {
    ...raw,
    data: bills,
    bills,
    pagination: raw?.pagination || parseStatePagination(raw),
  };
};

export const getBillsApi = async (params: GetBillsParams) => {
  const { data } = await api.get(BILLS_API.ROOT, {
    params: buildPagedQueryParams(params),
  });
  return toBillsResponse(data);
};

export const getAllBillsApi = async (params?: GetAllBillsParams) => {
  const { data } = await api.get(BILLS_API.ROOT, {
    params: buildQueryParams(params),
  });
  return toBillsResponse(data);
};

export const getBillByIdApi = async (id: string) => {
  const { data } = await api.get(BILLS_API.BY_ID(id));
  return data;
};

export const createBillApi = async (payload: BillPayload) => {
  const { data } = await api.post(BILLS_API.ROOT, payload);
  return data;
};

export const updateBillApi = async ({
  id,
  payload,
}: {
  id: string;
  payload: BillUpdatePayload;
}) => {
  const { data } = await api.put(BILLS_API.BY_ID(id), payload);
  return data;
};

export const deleteBillApi = async (id: string) => {
  const { data } = await api.delete(BILLS_API.BY_ID(id));
  return data;
};
