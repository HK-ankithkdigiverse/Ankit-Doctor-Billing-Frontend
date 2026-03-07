import { api } from "./axios";
import { buildPagedQueryParams, buildQueryParams, parseStatePagination } from "./pagination";
import { PRODUCTS_API } from "../constants";
import type { GetProductsParams } from "../types/api";

export type { GetProductsParams } from "../types/api";

type GetAllProductsParams = Omit<
  GetProductsParams,
  "page" | "limit" | "search" | "sortBy" | "sortOrder"
>;

const toProductsResponse = (raw: any) => {
  const products = raw?.products || raw?.product_data || raw?.data || [];
  return {
    ...raw,
    products,
    pagination: raw?.pagination || parseStatePagination(raw),
  };
};

export const getProductsApi = async (params: GetProductsParams) => {
  const { data } = await api.get(PRODUCTS_API.ROOT, {
    params: buildPagedQueryParams(params),
  });
  return toProductsResponse(data);
};

export const getAllProductsApi = async (params?: GetAllProductsParams) => {
  const { data } = await api.get(PRODUCTS_API.ROOT, {
    params: buildQueryParams(params),
  });
  return toProductsResponse(data);
};

export const getProductByIdApi = async (id: string) => {
  const { data } = await api.get(PRODUCTS_API.BY_ID(id));
  return data?.product || data;
};

export const createProductApi = async (payload: any) => {
  const { data } = await api.post(PRODUCTS_API.ROOT, payload);
  return data;
};

export const updateProductApi = async ({
  id,
  data: payload,
}: {
  id: string;
  data: any;
}) => {
  const { data } = await api.put(PRODUCTS_API.BY_ID(id), payload);
  return data;
};

export const deleteProductApi = async (id: string) => {
  const { data } = await api.delete(PRODUCTS_API.BY_ID(id));
  return data;
};

export const searchProductsApi = async (search: string) => {
  const response = await getProductsApi({ page: 1, search });
  return response?.products || [];
};
