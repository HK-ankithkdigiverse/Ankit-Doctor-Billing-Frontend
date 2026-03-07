import { api } from "./axios";
import { buildPagedQueryParams, buildQueryParams, parseStatePagination } from "./pagination";
import { CATEGORIES_API } from "../constants";
import type { CategoryDropdownItem, CreateCategoryPayload } from "../types/category";
import type { GetCategoriesParams, GetCategoriesResponse } from "../types/api";

export type { GetCategoriesParams, GetCategoriesResponse } from "../types/api";

type GetAllCategoriesParams = Omit<
  GetCategoriesParams,
  "page" | "limit" | "search" | "sortBy" | "sortOrder"
>;

const toCategoriesResponse = (raw: any): GetCategoriesResponse => {
  const categories = raw?.categories || raw?.category_data || [];
  return {
    categories,
    pagination: raw?.pagination || parseStatePagination(raw),
  };
};

export const getCategoriesApi = async (params: GetCategoriesParams) => {
  const { data } = await api.get(CATEGORIES_API.ROOT, {
    params: buildPagedQueryParams(params),
  });
  return toCategoriesResponse(data);
};

export const getAllCategoriesApi = async (params?: GetAllCategoriesParams) => {
  const { data } = await api.get(CATEGORIES_API.ROOT, {
    params: buildQueryParams(params),
  });
  return toCategoriesResponse(data);
};

export const getCategoryByIdApi = async (id: string) => {
  const { data } = await api.get(CATEGORIES_API.BY_ID(id));
  return data;
};

export const createCategoryApi = async (payload: CreateCategoryPayload) => {
  const { data } = await api.post(CATEGORIES_API.ROOT, payload);
  return data;
};

export const updateCategoryApi = async ({
  id,
  payload,
}: {
  id: string;
  payload: CreateCategoryPayload;
}) => {
  const { data } = await api.put(CATEGORIES_API.BY_ID(id), payload);
  return data;
};

export const deleteCategoryApi = async (id: string) => {
  const { data } = await api.delete(CATEGORIES_API.BY_ID(id));
  return data;
};

export const getCategoryDropdownApi = async (): Promise<CategoryDropdownItem[]> => {
  const { data } = await api.get(CATEGORIES_API.DROPDOWN);
  return data?.categories || data || [];
};
