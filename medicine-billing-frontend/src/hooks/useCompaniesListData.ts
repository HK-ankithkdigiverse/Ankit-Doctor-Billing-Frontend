import { useCallback, useMemo } from "react";
import type { Company } from "../types/company";
import { ROLE } from "../constants";
import { useCompanies, useDeleteCompany } from "./useCompanies";
import { useAllMedicalStores } from "./useMedicalStores";
import { useMe } from "./useMe";
import { useDebouncedValue } from "./useDebouncedValue";
import { useViewState } from "./useViewState";
import { getCompanyDisplayName } from "../utils/company";
import {
  buildMedicalStoreNameById,
  buildMedicalStoreOptions,
  getCompanyMedicalStoreId,
} from "../utils/medicalStore";
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

export const useCompaniesListData = () => {
  const {
    view: { page, limit, search, medicalStoreId, sortField, sortOrder },
    setPagination,
    setSearch,
    setMedicalStoreId,
    setSort,
  } = useViewState("companies");
  const debouncedSearch = useDebouncedValue(search, 500);
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const hasAdminStoreFilter = isAdmin && !!medicalStoreId;
  const canLoadMedicalStores = isAdmin;
  const allSelected = isAllPageLimit(limit);
  const queryPage = hasAdminStoreFilter && !allSelected ? 1 : page;
  const queryLimit = allSelected ? ALL_PAGE_SIZE : hasAdminStoreFilter ? 1000 : limit;

  const { data, isLoading, isFetching } = useCompanies(
    queryPage,
    queryLimit,
    debouncedSearch
  );
  const { data: medicalStoresData } = useAllMedicalStores({ enabled: canLoadMedicalStores });
  const searchLoading = search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteCompany, isPending } = useDeleteCompany();
  const companiesRaw: Company[] = data?.companies ?? [];
  const sortState = { field: sortField, order: sortOrder };

  const medicalStoreNameById = useMemo(
    () =>
      buildMedicalStoreNameById(medicalStoresData?.medicalStores),
    [medicalStoresData?.medicalStores]
  );

  const filteredCompanies = isAdmin
    ? companiesRaw.filter(
        (company) => !medicalStoreId || getCompanyMedicalStoreId(company) === medicalStoreId
      )
    : companiesRaw;

  const getCreatedByStoreLabel = (company: Company) => {
    const storeId = getCompanyMedicalStoreId(company);
    if (!storeId) return "-";
    return medicalStoreNameById.get(storeId) || "-";
  };

  const sortedCompanies = useMemo(
    () =>
      applyTableSort(filteredCompanies, sortState, {
        companyName: createNameSorter((row: Company) => getCompanyDisplayName(row)),
        createdBy: createNameSorter((row: Company) => getCreatedByStoreLabel(row)),
        createdUpdatedAt: createDateSorter(
          (row: Company) => (row as any).updatedAt || (row as any).createdAt
        ),
      }),
    [filteredCompanies, medicalStoreNameById, sortField, sortOrder]
  );

  const companies = hasAdminStoreFilter && !allSelected
    ? paginateByPage(sortedCompanies, page, limit)
    : sortedCompanies;
  const pagination = data?.pagination;
  const totalRecords =
    hasAdminStoreFilter || allSelected ? filteredCompanies.length : pagination?.total || 0;
  const pageSizeSelectOptions = buildPageSizeSelectOptions(totalRecords);

  const medicalStoreOptions = useMemo<{ label: string; value: string }[]>(
    () =>
      buildMedicalStoreOptions(medicalStoresData?.medicalStores, {
        fallbackToId: true,
        includeIds: companiesRaw
          .map((company) => getCompanyMedicalStoreId(company))
          .filter(Boolean),
      }),
    [companiesRaw, medicalStoresData?.medicalStores]
  );

  const requestMedicalStoreOptions = useCallback(() => {
    return;
  }, []);

  return {
    isAdmin,
    page,
    limit,
    search,
    medicalStoreId,
    sortState,
    companies,
    totalRecords,
    pageSizeSelectOptions,
    medicalStoreOptions,
    requestMedicalStoreOptions,
    searchLoading,
    isLoading,
    isPending,
    setPagination,
    setSearch,
    setMedicalStoreId,
    setSort,
    getCreatedByStoreLabel,
    deleteCompany,
  };
};
