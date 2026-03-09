import { useCallback, useMemo } from "react";
import type { Bill, DateFilterType } from "../types/bill";
import {
  type BillingDateRange,
  DATE_FILTER_OPTIONS,
  filterBills,
  getBillCompanyName,
  getBillMedicalStoreId,
  getBillMedicalStoreName,
} from "../utils/billing";
import { ROLE } from "../constants";
import { useBills, useDeleteBill } from "./useBills";
import { useMe } from "./useMe";
import { useDebouncedValue } from "./useDebouncedValue";
import { useViewState } from "./useViewState";
import { useAllMedicalStores } from "./useMedicalStores";
import { buildMedicalStoreNameById, buildMedicalStoreOptions } from "../utils/medicalStore";
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

export const useBillsListData = () => {
  const {
    view: { page, limit, search, medicalStoreId, dateFilter, sortField, sortOrder },
    customRange,
    setPagination,
    setSearch,
    setMedicalStoreId,
    setDateFilter,
    setCustomRange,
    setSort,
  } = useViewState("bills");
  const debouncedSearch = useDebouncedValue(search, 500);
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const hasAdminMedicalStoreFilter = isAdmin && !!medicalStoreId;
  const canLoadMedicalStores = isAdmin;
  const hasDateFilter = dateFilter !== "all";
  const hasLocalFilter = hasAdminMedicalStoreFilter || hasDateFilter;
  const allSelected = isAllPageLimit(limit);
  const queryPage = hasLocalFilter && !allSelected ? 1 : page;
  const queryLimit = allSelected ? ALL_PAGE_SIZE : hasLocalFilter ? 1000 : limit;

  const { data, isLoading, isFetching } = useBills(queryPage, queryLimit, debouncedSearch);
  const { data: medicalStoresData } = useAllMedicalStores({
    enabled: canLoadMedicalStores,
  });
  const searchLoading = search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteBill } = useDeleteBill();
  const medicalStoreNameById = useMemo(
    () => buildMedicalStoreNameById(medicalStoresData?.medicalStores),
    [medicalStoresData?.medicalStores]
  );
  const sortState = { field: sortField, order: sortOrder };

  const getBillMedicalStoreLabel = (bill: any) => {
    const embeddedName = getBillMedicalStoreName(bill);
    if (embeddedName !== "-") return embeddedName;

    const storeId = getBillMedicalStoreId(bill);
    if (!storeId) return "-";
    return medicalStoreNameById.get(storeId) || "-";
  };

  const rowsRaw: Bill[] = data?.data ?? [];
  const filteredRows = filterBills(rowsRaw, {
    isAdmin,
    medicalStoreId,
    dateFilter,
    customRange,
  });
  const sortedRows = useMemo(
    () =>
      applyTableSort(filteredRows, sortState, {
        company: createNameSorter((row: any) => getBillCompanyName(row)),
        medicalStore: createNameSorter((row: any) => getBillMedicalStoreLabel(row)),
        createdUpdatedAt: createDateSorter((row: any) => row?.updatedAt || row?.createdAt),
      }),
    [filteredRows, medicalStoreNameById, sortField, sortOrder]
  );
  const rows =
    hasLocalFilter && !allSelected ? paginateByPage(sortedRows, page, limit) : sortedRows;
  const pagination = data?.pagination;
  const totalRecords =
    hasLocalFilter || allSelected ? filteredRows.length : pagination?.total || 0;
  const pageSizeSelectOptions = buildPageSizeSelectOptions(totalRecords);
  const medicalStoreOptions = useMemo(
    () =>
      buildMedicalStoreOptions(medicalStoresData?.medicalStores, {
        includeInactive: true,
        fallbackToId: true,
        includeIds: rowsRaw.map((bill) => getBillMedicalStoreId(bill)).filter(Boolean),
        sort: false,
      }),
    [rowsRaw, medicalStoresData?.medicalStores]
  );
  const requestMedicalStoreOptions = useCallback(() => {
    return;
  }, []);

  return {
    page,
    limit,
    search,
    medicalStoreId,
    dateFilter,
    customRange,
    isAdmin,
    sortState,
    rows,
    totalRecords,
    pageSizeSelectOptions,
    medicalStoreOptions,
    requestMedicalStoreOptions,
    searchLoading,
    isLoading,
    setPagination,
    setSearch,
    setMedicalStoreId,
    setDateFilter,
    setCustomRange,
    setSort,
    deleteBill,
    getBillMedicalStoreLabel,
    getBillCompanyName,
    DATE_FILTER_OPTIONS,
  };
};

export type { DateFilterType, BillingDateRange };
