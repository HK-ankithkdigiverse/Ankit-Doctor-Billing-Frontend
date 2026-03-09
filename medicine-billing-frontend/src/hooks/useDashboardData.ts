import { useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { getAllBillsApi, getDashboardApi } from "../api/resourceApi";
import { QUERY_KEYS, ROLE, ROUTES } from "../constants";
import { DATE_FILTER_OPTIONS, filterBills } from "../utils/billing";
import { toEntityId } from "../utils/id";
import { paginateByPage } from "../utils/pagination";
import { useMe } from "./useMe";
import { useViewState } from "./useViewState";

export const useDashboardData = () => {
  const location = useLocation();
  const {
    view: { medicalStoreId: medicalStoreFilter, dateFilter, page, limit },
    customRange,
    setMedicalStoreId,
    setDateFilter,
    setCustomRange,
    setPagination,
  } = useViewState("dashboard");
  const { data: user, isLoading } = useMe();

  const isAdmin = user?.role === ROLE.ADMIN;
  const isDashboardRoute =
    location.pathname === ROUTES.DASHBOARD ||
    location.pathname === `${ROUTES.DASHBOARD}/`;
  const canLoadDashboardData = isDashboardRoute && !isLoading && !!user;

  const meMedicalStoreId =
    toEntityId(user?.medicalStoreId) ||
    (typeof user?.medicineId === "string" ? user.medicineId : "");
  const effectiveMedicalStoreId = isAdmin ? medicalStoreFilter : meMedicalStoreId;

  const {
    data: dashboardData,
    refetch: refetchDashboardTotals,
    isFetching: isDashboardTotalsFetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_SUMMARY, "totals"],
    queryFn: () => getDashboardApi(),
    enabled: canLoadDashboardData,
  });

  const {
    data: billsDataQuery,
    refetch: refetchBills,
    isFetching: isBillsFetching,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.BILLS,
      "dashboard",
      isAdmin ? medicalStoreFilter || "all" : "self",
    ],
    queryFn: () =>
      getAllBillsApi({
        medicalStoreId: isAdmin ? medicalStoreFilter || undefined : undefined,
      }),
    enabled: canLoadDashboardData,
  });

  const refreshDashboardData = useCallback(() => {
    if (!isDashboardRoute) return;
    void Promise.all([refetchDashboardTotals(), refetchBills()]);
  }, [isDashboardRoute, refetchDashboardTotals, refetchBills]);

  useEffect(() => {
    const handleDashboardRefresh = () => refreshDashboardData();
    window.addEventListener("dashboard:refresh", handleDashboardRefresh);
    return () =>
      window.removeEventListener("dashboard:refresh", handleDashboardRefresh);
  }, [refreshDashboardData]);

  const currentUserMedicalStoreName =
    (typeof user?.medicalStoreId === "object" &&
      ((user.medicalStoreId as any)?.medicalStoreName ||
        (user.medicalStoreId as any)?.name)) ||
    (typeof (user as any)?.medicalStoreName === "string"
      ? (user as any).medicalStoreName
      : "") ||
    "-";

  const billsRaw = billsDataQuery?.data ?? [];

  const filteredBillsForStore = useMemo(
    () =>
      filterBills(billsRaw, {
        isAdmin,
        medicalStoreId: isAdmin ? effectiveMedicalStoreId || undefined : undefined,
        dateFilter,
        customRange,
      }),
    [billsRaw, isAdmin, effectiveMedicalStoreId, dateFilter, customRange]
  );

  const sortedBillsAll = useMemo(
    () =>
      [...filteredBillsForStore].sort(
        (a: any, b: any) =>
          new Date(b?.createdAt || b?.updatedAt || 0).getTime() -
          new Date(a?.createdAt || a?.updatedAt || 0).getTime()
      ),
    [filteredBillsForStore]
  );

  const sortedBillsForStore = useMemo(
    () => paginateByPage(sortedBillsAll, page, limit),
    [sortedBillsAll, page, limit]
  );

  const selectedBillsTotal = sortedBillsAll.length;
  const isDashboardFetching = isDashboardTotalsFetching || isBillsFetching;

  return {
    user,
    isLoading,
    isAdmin,
    medicalStoreFilter,
    setMedicalStoreFilter: setMedicalStoreId,
    dateFilter,
    customRange,
    setDateFilter,
    setCustomRange,
    dateFilterOptions: DATE_FILTER_OPTIONS,
    page,
    limit,
    setDashboardPagination: setPagination,
    effectiveMedicalStoreId,
    currentUserMedicalStoreName,
    medicalStoreOptions: [] as Array<{ value: string; label: string }>,
    filteredCompanies: [] as any[],
    filteredProducts: [] as any[],
    filteredCategories: [] as any[],
    filteredUsers: [] as any[],
    filteredBillsForStore: sortedBillsAll as any[],
    sortedBillsForStore: sortedBillsForStore as any[],
    scopedMedicalStores: [] as any[],
    companiesData: null as any,
    productsData: null as any,
    categoriesData: null as any,
    usersData: null as any,
    billsData: { pagination: { total: selectedBillsTotal } } as any,
    medicalStoresData: null as any,
    selectedBillsTotal,
    dashboardTotals: dashboardData?.dashboard,
    isDashboardFetching,
    refreshDashboardData,
  };
};