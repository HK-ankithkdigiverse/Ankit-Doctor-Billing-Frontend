// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getProductByIdApi,
} from "../api/productApi";
import { QUERY_KEYS } from "../constants";

/* -------- GET (LIST) -------- */
export const useProducts = (
  page: number,
  limit: number = 10,
  search: string = "",
  filters?: {
    category?: string;
    productType?: string;
    companyId?: string;
    createdBy?: string;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS_LIST({
      page,
      limit,
      search,
      category: filters?.category,
      productType: filters?.productType,
      companyId: filters?.companyId,
      createdBy: filters?.createdBy,
    }),
    queryFn: () =>
      getProductsApi({
        page,
        limit,
        search: search || undefined,
        category: filters?.category,
        productType: filters?.productType,
        companyId: filters?.companyId,
        createdBy: filters?.createdBy,
      }),
    enabled: filters?.enabled ?? true,

    placeholderData: (prev) => prev,
    staleTime: 1000 * 5,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT(id),
    queryFn: () => getProductByIdApi(id),
    enabled: !!id,
  });
};

/* -------- CREATE -------- */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCTS,
      });
    },
  });
};

/* -------- UPDATE -------- */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCT(variables.id),
      });
    },
  });
};


/* -------- DELETE -------- */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCTS,
      });
    },
  });
};
