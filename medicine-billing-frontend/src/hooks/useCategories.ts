import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCategoryApi,
  deleteCategoryApi,
  getAllCategoriesApi,
  getCategoriesApi,
  getCategoryByIdApi,
  getCategoryDropdownApi,
  updateCategoryApi,
} from "../api/resourceApi";
import { QUERY_KEYS } from "../constants/queryKeys";
import { invalidateQueryKeys, parsePaginatedListArgs } from "./queryHelpers";

type CategoriesQueryOptions = { enabled?: boolean };
type AllCategoriesOptions = { enabled?: boolean; medicalStoreId?: string };

export const useCategories = (
  page?: number,
  limitOrSearch?: number | string,
  searchOrOptions: string | CategoriesQueryOptions = "",
  optionsArg?: CategoriesQueryOptions
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
      ? [QUERY_KEYS.CATEGORIES, pageNumber, limit, search]
      : [QUERY_KEYS.CATEGORIES, "all"],
    queryFn: () =>
      isPaginated
        ? getCategoriesApi({
            page: pageNumber,
            limit,
            search: search || undefined,
          })
        : getAllCategoriesApi(),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllCategories = (options?: AllCategoriesOptions) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, "all", options?.medicalStoreId],
    queryFn: () =>
      getAllCategoriesApi({
        medicalStoreId: options?.medicalStoreId,
      }),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORY, id],
    queryFn: () => getCategoryByIdApi(id),
    enabled: !!id,
  });
};

export const useCategoryDropdown = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES_DROPDOWN],
    queryFn: getCategoryDropdownApi,
    staleTime: 1000 * 30,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [QUERY_KEYS.CATEGORIES]);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategoryApi,
    onSuccess: (_, variables) => {
      invalidateQueryKeys(
        queryClient,
        [QUERY_KEYS.CATEGORIES],
        [QUERY_KEYS.CATEGORY, variables.id]
      );
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [QUERY_KEYS.CATEGORIES]);
    },
  });
};
