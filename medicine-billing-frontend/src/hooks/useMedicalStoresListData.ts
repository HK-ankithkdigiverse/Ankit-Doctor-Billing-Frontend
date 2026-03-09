import { useMemo } from "react";
import type { MedicalStore } from "../types";
import {
  useDeleteMedicalStore,
  useMedicalStores,
  useUpdateMedicalStore,
} from "./useMedicalStores";
import { useDebouncedValue } from "./useDebouncedValue";
import { useViewState } from "./useViewState";
import {
  ALL_PAGE_SIZE,
  buildPageSizeSelectOptions,
  isAllPageLimit,
  paginateByPage,
} from "../utils/pagination";
import {
  applyTableSort,
  createDateSorter,
  createNameSorter,
} from "../utils/tableSort";

export const useMedicalStoresListData = () => {
  const {
    view: { page, limit, search, storeStatus, sortField, sortOrder },
    setPagination,
    setSearch,
    setStoreStatus,
    setSort,
  } = useViewState("medicalStores");
  const debouncedSearch = useDebouncedValue(search, 500);
  const hasStatusFilter = storeStatus !== "all";
  const allSelected = isAllPageLimit(limit);
  const queryPage = hasStatusFilter && !allSelected ? 1 : page;
  const queryLimit = allSelected ? ALL_PAGE_SIZE : hasStatusFilter ? 1000 : limit;

  const { data, isLoading, isFetching } = useMedicalStores(
    queryPage,
    queryLimit,
    debouncedSearch
  );
  const searchLoading = search !== debouncedSearch || isFetching;
  const { mutateAsync: updateMedicalStore, isPending: isUpdatePending } =
    useUpdateMedicalStore();
  const { mutateAsync: deleteMedicalStore, isPending: isDeletePending } =
    useDeleteMedicalStore();
  const sortState = { field: sortField, order: sortOrder };

  const storesRaw = data?.medicalStores ?? [];
  const storesFilteredByStatus = storesRaw.filter((store) => {
    if (storeStatus === "active") return store.isActive !== false;
    if (storeStatus === "inactive") return store.isActive === false;
    return true;
  });
  const sortedStores = useMemo(
    () =>
      applyTableSort(storesFilteredByStatus, sortState, {
        name: createNameSorter((row: MedicalStore) => row.name),
        createdUpdatedAt: createDateSorter((row: MedicalStore) => row.updatedAt || row.createdAt),
      }),
    [storesFilteredByStatus, sortField, sortOrder]
  );
  const stores = hasStatusFilter && !allSelected
    ? paginateByPage(sortedStores, page, limit)
    : sortedStores;
  const totalRecords = hasStatusFilter || allSelected
    ? storesFilteredByStatus.length
    : data?.pagination?.total || 0;
  const pageSizeSelectOptions = buildPageSizeSelectOptions(totalRecords);

  return {
    page,
    limit,
    search,
    storeStatus,
    sortState,
    stores,
    totalRecords,
    pageSizeSelectOptions,
    searchLoading,
    isLoading,
    isUpdatePending,
    isDeletePending,
    setPagination,
    setSearch,
    setStoreStatus,
    setSort,
    updateMedicalStore,
    deleteMedicalStore,
  };
};
