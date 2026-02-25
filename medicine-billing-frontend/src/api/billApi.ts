import { api } from "./axios";
import { BILLS_API } from "../constants";

/* =========================
   GET ALL BILLS
========================= */
export const getBillsApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const { data } = await api.get(BILLS_API.ROOT, { params });
  return data;
};

/* =========================
   GET BILL BY ID
========================= */
export const getBillByIdApi = async (id: string) => {
  const { data } = await api.get(BILLS_API.BY_ID(id));
  return data;
};

/* =========================
   CREATE BILL
========================= */
export const createBillApi = async (payload: {
  userId?: string;
  companyId: string;
  discount?: number;
  items: {
    productId: string;
    qty: number;
    freeQty?: number;
    rate: number;
    taxPercent: number;
    discount?: number;
  }[];
}) => {
  try {
    const { data } = await api.post(BILLS_API.ROOT, {
      ...payload,
      discount: payload.discount || 0,
    });

    return data;
  } catch (err: any) {
    const responseData = err?.response?.data;
    const detailMessage =
      Array.isArray(responseData?.error) && responseData.error.length
        ? responseData.error[0]
        : responseData?.error?.message;

    console.error("Create Bill Error:", responseData);
    throw new Error(detailMessage || responseData?.message || "Failed to create bill");
  }
};

/* =========================
   DELETE BILL
========================= */
export const deleteBillApi = async (id: string) => {
  const { data } = await api.delete(BILLS_API.BY_ID(id));
  return data;
};

/* =========================
   UPDATE BILL
========================= */
export const updateBillApi = async ({
  id,
  payload,
}: {
  id: string;
  payload: {
    discount: number;
    userId?: string;
    companyId?: string;
    items?: {
      productId: string;
      qty: number;
      freeQty?: number;
      rate: number;
      taxPercent: number;
      discount?: number;
    }[];
  };
}) => {
  try {
    const { data } = await api.put(BILLS_API.BY_ID(id), payload);
    return data;
  } catch (err: any) {
    const responseData = err?.response?.data;
    const detailMessage =
      Array.isArray(responseData?.error) && responseData.error.length
        ? responseData.error[0]
        : responseData?.error?.message;
    throw new Error(detailMessage || responseData?.message || "Failed to update bill");
  }
};
