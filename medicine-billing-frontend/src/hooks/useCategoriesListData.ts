import { useMemo } from "react";
import type { Category } from "../types/category";
import { useCategories, useDeleteCategory } from "./useCategories";
import { useMe } from "./useMe";
import { useDebouncedValue } from "./useDebouncedValue";
import { useViewState } from "./useViewState";
import { buildMedicalStoreNameById, getCategoryMedicalStoreId } from "../utils/medicalStore";
import { buildPageSizeSelectOptions } from "../utils/pagination";
import {
  applyTableSort,
  createDateSorter,
  createNameSorter,
} from "../utils/tableSort";
import { useAllMedicalStores } from "./useMedicalStores";

export const useCategoriesListData = () => {
  const {
    view: { page, limit, search, sortField, sortOrder },
    setPagination,
    setSearch,
    setSort,
  } = useViewState("categories");
  const debouncedSearch = useDebouncedValue(search, 500);
  const { data: me } = useMe();
  const isAdmin = String(me?.role || "").toUpperCase() === "ADMIN";
  const { data: medicalStoresData } = useAllMedicalStores({ enabled: isAdmin });
  const medicalStoreNameById = useMemo(
    () => buildMedicalStoreNameById(medicalStoresData?.medicalStores),
    [medicalStoresData?.medicalStores]
  );

  const { data, isLoading, isFetching, error } = useCategories(page, limit, debouncedSearch);
  const searchLoading = search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteCategory, isPending } = useDeleteCategory();

  const categories = data?.categories ?? [];
  const pagination = data?.pagination;
  const totalRecords = pagination?.total || 0;
  const pageSizeSelectOptions = buildPageSizeSelectOptions(totalRecords);
  const sortState = { field: sortField, order: sortOrder };

  const getMedicalStoreId = (category: Category) => getCategoryMedicalStoreId(category);

  const getMedicalStoreName = (category: Category) => {
    const populatedStoreName =
      typeof category.medicalStoreId === "object"
        ? (category.medicalStoreId?.name || "").trim()
        : "";
    if (populatedStoreName) return populatedStoreName;
    const storeId = getMedicalStoreId(category);
    if (!storeId) return "-";
    return medicalStoreNameById.get(storeId) || "-";
  };

  const sortedCategories = useMemo(
    () =>
      applyTableSort(categories, sortState, {
        name: createNameSorter((row: Category) => row.name),
        medicalStore: createNameSorter((row: Category) => getMedicalStoreName(row)),
        createdUpdatedAt: createDateSorter((row: Category) => row.updatedAt || row.createdAt),
      }),
    [categories, medicalStoreNameById, sortField, sortOrder]
  );

  return {
    isAdmin,
    page,
    limit,
    search,
    sortState,
    sortedCategories,
    totalRecords,
    pageSizeSelectOptions,
    searchLoading,
    isLoading,
    isPending,
    error,
    setPagination,
    setSearch,
    setSort,
    getMedicalStoreName,
    deleteCategory,
  };
};
