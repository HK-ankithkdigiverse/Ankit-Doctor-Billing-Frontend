import { api } from "./axios";
import { dataOf } from "./http";
import { CATEGORIES_API } from "../constants";
import type {
  Category,
  CategoryDropdownItem,
  CreateCategoryPayload,
} from "../types/category";

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetCategoriesResponse {
  categories: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getCategoriesApi = async (
  params: GetCategoriesParams
): Promise<GetCategoriesResponse> => dataOf(api.get(CATEGORIES_API.ROOT, { params }));

export const getCategoryByIdApi = (id: string): Promise<Category> =>
  dataOf(api.get(CATEGORIES_API.BY_ID(id)));

export const createCategoryApi = async (
  payload: CreateCategoryPayload
): Promise<{ message: string; category: Category }> =>
  dataOf(api.post(CATEGORIES_API.ROOT, payload));

export const updateCategoryApi = async ({
  id,
  payload,
}: {
  id: string;
  payload: CreateCategoryPayload;
}): Promise<{ message: string; category: Category }> =>
  dataOf(api.put(CATEGORIES_API.BY_ID(id), payload));

export const deleteCategoryApi = (id: string): Promise<{ message: string }> =>
  dataOf(api.delete(CATEGORIES_API.BY_ID(id)));

export const getCategoryDropdownApi = async (): Promise<CategoryDropdownItem[]> => {
  const data = await dataOf<any>(api.get(CATEGORIES_API.DROPDOWN));
  return data?.categories ?? data ?? [];
};
