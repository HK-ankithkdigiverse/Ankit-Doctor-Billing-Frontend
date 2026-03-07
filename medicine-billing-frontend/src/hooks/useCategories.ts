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
} from "../api/categoryApi";
import { QUERY_KEYS } from "../constants/queryKeys";

type CategoriesQueryOptions = { enabled?: boolean };
type AllCategoriesOptions = { enabled?: boolean; medicalStoreId?: string };

export const useCategories = (
  page?: number,
  limitOrSearch?: number | string,
  searchOrOptions: string | CategoriesQueryOptions = "",
  optionsArg?: CategoriesQueryOptions
) => {
  const isPaginated = typeof page === "number";
  const limit = typeof limitOrSearch === "number" ? limitOrSearch : undefined;
  const search =
    typeof limitOrSearch === "string"
      ? limitOrSearch
      : typeof searchOrOptions === "string"
        ? searchOrOptions
        : "";
  const options = typeof searchOrOptions === "object" ? searchOrOptions : optionsArg;

  return useQuery({
    queryKey: isPaginated
      ? [QUERY_KEYS.CATEGORIES, page, limit, search]
      : [QUERY_KEYS.CATEGORIES, "all"],
    queryFn: () =>
      isPaginated
        ? getCategoriesApi({
            page,
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategoryApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORY, variables.id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
    },
  });
};
