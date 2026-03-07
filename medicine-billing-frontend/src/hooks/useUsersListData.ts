import type { User } from "../types";
import { useUsers, useUpdateUser, useDeleteUser } from "./useUsers";
import { useDebouncedValue } from "./useDebouncedValue";
import { useViewState } from "./useViewState";
import { useMe } from "./useMe";
import { getUserMedicalStoreId } from "../utils/medicalStore";
import { buildPageSizeSelectOptions } from "../utils/pagination";
import {
  applyTableSort,
  createDateSorter,
  createNameSorter,
} from "../utils/tableSort";
import { useAllMedicalStores } from "./useMedicalStores";
import { useMemo } from "react";
import { resolveBillTaxMode } from "../utils/tax";

export const useUsersListData = () => {
  const {
    view: { page, limit, search, userStatus, sortField, sortOrder },
    setPagination,
    setSearch,
    setUserStatus,
    setSort,
  } = useViewState("users");
  const debouncedSearch = useDebouncedValue(search, 500);
  const { data: me } = useMe();

  const { data: medicalStoresData } = useAllMedicalStores();
  const normalizedSortOrder = sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined;
  const normalizedSortBy = normalizedSortOrder ? sortField : undefined;

  const { data, isLoading, isFetching } = useUsers(
    page,
    limit,
    debouncedSearch,
    userStatus,
    { sortBy: normalizedSortBy, sortOrder: normalizedSortOrder }
  );
  const searchLoading = search !== debouncedSearch || isFetching;
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();
  const sortState = { field: sortField, order: sortOrder };

  const usersRaw = data?.users ?? [];
  const pagination = data?.pagination;
  const getMedicalStoreId = (user: User) => getUserMedicalStoreId(user);
  const getMedicalStoreName = (user: User) => {
    const populatedStoreName =
      typeof user.medicalStoreId === "object"
        ? (user.medicalStoreId?.name || "").trim()
        : "";
    if (populatedStoreName) return populatedStoreName;

    const fallbackName = (user.medicalName || "").trim();
    if (fallbackName) return fallbackName;

    const storeId = getMedicalStoreId(user);
    if (!storeId) return "-";
    return storeId;
  };

  const medicalStoreGstMap = useMemo(() => {
    const map = new Map<string, string | undefined>();
    (medicalStoresData?.medicalStores ?? []).forEach((store: any) => {
      const id = String(store?._id || "").trim();
      if (!id) return;
      map.set(id, store.gstType || resolveBillTaxMode(store));
    });
    return map;
  }, [medicalStoresData?.medicalStores]);

  const getMedicalStoreGstType = (user: User) => {
    if (typeof user.medicalStoreId === "object") {
      return (user.medicalStoreId as any)?.gstType || resolveBillTaxMode(user.medicalStore as any);
    }
    const storeId = getMedicalStoreId(user);
    if (!storeId) return undefined;
    return medicalStoreGstMap.get(storeId) || undefined;
  };
  const matchesStatus = (user: User) =>
    userStatus === "active" ? user.isActive !== false : user.isActive === false;
  const query = debouncedSearch.trim().toLowerCase();
  const matchesSearch = (user: User) => {
    if (!query) return true;

    return Object.values(user).some((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "object") {
        return JSON.stringify(value).toLowerCase().includes(query);
      }
      return String(value).toLowerCase().includes(query);
    });
  };

  const backendAlreadyFiltered = usersRaw.every(matchesStatus);
  const users = backendAlreadyFiltered ? usersRaw : usersRaw.filter(matchesStatus);
  const filteredUsers = users.filter(matchesSearch);
  const sortedUsers = applyTableSort(filteredUsers, sortState, {
    name: createNameSorter((row: User) => row.name),
    medicalStore: createNameSorter((row: User) => getMedicalStoreName(row)),
    createdUpdatedAt: createDateSorter((row: User) => row.updatedAt || row.createdAt),
  });
  const totalRecords = query
    ? filteredUsers.length
    : backendAlreadyFiltered
      ? pagination?.total || 0
      : users.length;
  const pageSizeSelectOptions = buildPageSizeSelectOptions(totalRecords);

  return {
    page,
    limit,
    search,
    userStatus,
    me,
    sortState,
    sortedUsers,
    totalRecords,
    pageSizeSelectOptions,
    searchLoading,
    isLoading,
    isPending,
    data,
    setPagination,
    setSearch,
    setUserStatus,
    setSort,
    getMedicalStoreName,
    getMedicalStoreGstType,
    updateUser,
    deleteUser,
  };
};
