import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createProductApi,
  deleteProductApi,
  getAllProductsApi,
  getProductByIdApi,
  getProductsApi,
  updateProductApi,
} from "../api/resourceApi";
import { QUERY_KEYS } from "../constants/queryKeys";
import { isObjectId } from "../utils/common";
import { invalidateQueryKeys, parsePaginatedListArgs } from "./queryHelpers";

type ProductFilters = {
  category?: string;
  productType?: string;
  companyId?: string;
  medicalStoreId?: string;
  enabled?: boolean;
};

export const useProducts = (
  page?: number,
  limitOrSearch?: number | string,
  searchOrFilters: string | ProductFilters = "",
  filtersArg?: ProductFilters
) => {
  const { isPaginated, limit, search, options: filters } = parsePaginatedListArgs(
    page,
    limitOrSearch,
    searchOrFilters,
    filtersArg
  );
  const pageNumber = typeof page === "number" ? page : 1;

  return useQuery({
    queryKey: isPaginated
      ? [
          QUERY_KEYS.PRODUCTS,
          pageNumber,
          limit,
          search,
          filters?.category,
          filters?.productType,
          filters?.companyId,
          filters?.medicalStoreId,
        ]
      : [
          QUERY_KEYS.PRODUCTS,
          "all",
          filters?.category,
          filters?.productType,
          filters?.companyId,
          filters?.medicalStoreId,
        ],
    queryFn: () =>
      isPaginated
        ? getProductsApi({
            page: pageNumber,
            limit,
            search: search || undefined,
            category: filters?.category,
            productType: filters?.productType,
            companyId: filters?.companyId,
            medicalStoreId: filters?.medicalStoreId,
          })
        : getAllProductsApi({
            search: search || undefined,
            category: filters?.category,
            productType: filters?.productType,
            companyId: filters?.companyId,
            medicalStoreId: filters?.medicalStoreId,
          }),
    enabled: filters?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.PRODUCTS,
      "all",
      filters?.category,
      filters?.productType,
      filters?.companyId,
      filters?.medicalStoreId,
    ],
    queryFn: () =>
      getAllProductsApi({
        category: filters?.category,
        productType: filters?.productType,
        companyId: filters?.companyId,
        medicalStoreId: filters?.medicalStoreId,
      }),
    enabled: filters?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT, id],
    queryFn: () => getProductByIdApi(id),
    enabled: isObjectId(id),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [QUERY_KEYS.PRODUCTS]);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductApi,
    onSuccess: (_, variables) => {
      invalidateQueryKeys(
        queryClient,
        [QUERY_KEYS.PRODUCTS],
        [QUERY_KEYS.PRODUCT, variables.id]
      );
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [QUERY_KEYS.PRODUCTS]);
    },
  });
};
