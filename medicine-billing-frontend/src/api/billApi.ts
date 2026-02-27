import { api } from "./axios";
import { BILLS_API } from "../constants";
import { dataOf } from "./http";
import type { BillPayload, BillUpdatePayload } from "../types/bill";

const getErrorMessage = (error: any, fallback: string) => {
  const responseData = error?.response?.data;
  const detailMessage =
    Array.isArray(responseData?.error) && responseData.error.length
      ? responseData.error[0]
      : responseData?.error?.message;
  return detailMessage || responseData?.message || fallback;
};

const requestWithError = async <T>(request: Promise<T>, fallback: string) => {
  try {
    return await request;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallback));
  }
};

export const getBillsApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => dataOf(api.get(BILLS_API.ROOT, { params }));

export const getBillByIdApi = (id: string) => dataOf(api.get(BILLS_API.BY_ID(id)));

export const createBillApi = (payload: BillPayload) =>
  requestWithError(
    dataOf(
      api.post(BILLS_API.ROOT, {
        ...payload,
        discount: payload.discount || 0,
      })
    ),
    "Failed to create bill"
  );

export const deleteBillApi = (id: string) => dataOf(api.delete(BILLS_API.BY_ID(id)));

export const updateBillApi = ({
  id,
  payload,
}: {
  id: string;
  payload: BillUpdatePayload;
}) => requestWithError(dataOf(api.put(BILLS_API.BY_ID(id), payload)), "Failed to update bill");
