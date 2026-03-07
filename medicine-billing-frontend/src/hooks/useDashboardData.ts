import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  getAllBillsApi,
  getAllCategoriesApi,
  getAllCompaniesApi,
  getDashboardSummaryApi,
  getAllMedicalStoresApi,
  getAllProductsApi,
} from "../api/resourceApi";
import { getAllUsersApi } from "../api/userApi";
import { QUERY_KEYS, ROLE, ROUTES } from "../constants";
import { toEntityId } from "../utils/id";
import { buildMedicalStoreNameById, getUserMedicalStoreId } from "../utils/medicalStore";
import {
  buildCompanyMedicalStoreIdByCompanyId,
  buildUserMedicalStoreIdByUserId,
  createStoreIdResolver,
  enrichMedicalStoreNameByIdFromUsers,
  filterByMedicalStore,
  getBillResolvedMedicalStoreIdForDashboard,
  getCategoryMedicalStoreIdForDashboard,
  getCompanyMedicalStoreIdForDashboard,
  getProductMedicalStoreIdForDashboard,
  resolveCurrentUserMedicalStoreName,
  toMedicalStoreOptionsFromNameMap,
} from "../utils/dashboard";
import { useMe } from "./useMe";

export const useDashboardData = () => {
  const location = useLocation();
  const [medicalStoreFilter, setMedicalStoreFilter] = useState("");
  const { data: user, isLoading } = useMe();

  const isAdmin = user?.role === ROLE.ADMIN;
  const isDashboardRoute =
    location.pathname === ROUTES.DASHBOARD ||
    location.pathname === `${ROUTES.DASHBOARD}/`;
  const canLoadDashboardData = isDashboardRoute && !isLoading && !!user;
  const canLoadAdminOnlyData = canLoadDashboardData && isAdmin;
  const meMedicalStoreId =
    toEntityId(user?.medicalStoreId) ||
    (typeof user?.medicineId === "string" ? user.medicineId : "");
  const effectiveMedicalStoreId = isAdmin ? medicalStoreFilter : meMedicalStoreId;
  const selectedMedicalStore = effectiveMedicalStoreId || "";

  const {
    data: dashboardSummaryData,
    refetch: refetchDashboardSummary,
    isFetching: isDashboardSummaryFetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_SUMMARY, selectedMedicalStore],
    queryFn: async () => {
      try {
        return await getDashboardSummaryApi({
          medicalStoreId: selectedMedicalStore || undefined,
        });
      } catch {
        const [bills, products, companies, categories, users, medicalStores] = await Promise.all([
          getAllBillsApi({
            medicalStoreId: selectedMedicalStore || undefined,
          }),
          getAllProductsApi({
            medicalStoreId: selectedMedicalStore || undefined,
          }),
          getAllCompaniesApi({
            medicalStoreId: selectedMedicalStore || undefined,
          }),
          getAllCategoriesApi({
            medicalStoreId: selectedMedicalStore || undefined,
          }),
          getAllUsersApi(),
          getAllMedicalStoresApi(),
        ]);

        return {
          bills,
          products,
          companies,
          categories,
          users,
          medicalStores,
        };
      }
    },
    enabled: canLoadAdminOnlyData,
  });

  const {
    data: billsDataQuery,
    refetch: refetchBillsQuery,
    isFetching: isBillsFetchingQuery,
  } = useQuery({
    queryKey: [QUERY_KEYS.BILLS, "dashboard", selectedMedicalStore],
    queryFn: () =>
      getAllBillsApi({
        medicalStoreId: isAdmin ? selectedMedicalStore || undefined : undefined,
      }),
    enabled: canLoadDashboardData && !isAdmin,
  });

  const {
    data: companiesDataQuery,
    refetch: refetchCompaniesQuery,
    isFetching: isCompaniesFetchingQuery,
  } = useQuery({
    queryKey: [QUERY_KEYS.COMPANIES, "dashboard", selectedMedicalStore],
    queryFn: () =>
      getAllCompaniesApi({
        medicalStoreId: isAdmin ? selectedMedicalStore || undefined : undefined,
      }),
    enabled: canLoadDashboardData && !isAdmin,
  });

  const {
    data: categoriesDataQuery,
    refetch: refetchCategoriesQuery,
    isFetching: isCategoriesFetchingQuery,
  } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, "dashboard", selectedMedicalStore],
    queryFn: () =>
      getAllCategoriesApi({
        medicalStoreId: isAdmin ? selectedMedicalStore || undefined : undefined,
      }),
    enabled: canLoadDashboardData && !isAdmin,
  });

  const billsData = isAdmin ? dashboardSummaryData?.bills : billsDataQuery;
  const productsData = isAdmin ? dashboardSummaryData?.products : undefined;
  const companiesData = isAdmin ? dashboardSummaryData?.companies : companiesDataQuery;
  const categoriesData = isAdmin ? dashboardSummaryData?.categories : categoriesDataQuery;
  const usersData = isAdmin ? dashboardSummaryData?.users : undefined;
  const medicalStoresData = isAdmin ? dashboardSummaryData?.medicalStores : undefined;

  const refreshDashboardData = useCallback(() => {
    if (!isDashboardRoute) return;

    if (isAdmin) {
      void refetchDashboardSummary();
      return;
    }

    void Promise.all([
      refetchCompaniesQuery(),
      refetchCategoriesQuery(),
      refetchBillsQuery(),
    ]);
  }, [
    isDashboardRoute,
    isAdmin,
    refetchDashboardSummary,
    refetchCompaniesQuery,
    refetchCategoriesQuery,
    refetchBillsQuery,
  ]);

  const isDashboardFetching =
    (isAdmin && isDashboardSummaryFetching) ||
    isCompaniesFetchingQuery ||
    isCategoriesFetchingQuery ||
    isBillsFetchingQuery;

  useEffect(() => {
    const handleDashboardRefresh = () => refreshDashboardData();
    window.addEventListener("dashboard:refresh", handleDashboardRefresh);
    return () =>
      window.removeEventListener("dashboard:refresh", handleDashboardRefresh);
  }, [refreshDashboardData]);

  const usersRaw = usersData?.users ?? [];
  const currentUserId = toEntityId(user?._id);
  const userMedicalStoreIdByUserId = buildUserMedicalStoreIdByUserId(
    usersRaw,
    currentUserId,
    meMedicalStoreId
  );

  const resolveStoreIdByUserId = createStoreIdResolver({
    userMedicalStoreIdByUserId,
    currentUserId,
    currentUserMedicalStoreId: meMedicalStoreId,
  });

  const medicalStoreNameById = enrichMedicalStoreNameByIdFromUsers(
    buildMedicalStoreNameById(medicalStoresData?.medicalStores),
    usersRaw
  );

  const medicalStoreOptions = toMedicalStoreOptionsFromNameMap(medicalStoreNameById);

  const currentUserMedicalStoreName = resolveCurrentUserMedicalStoreName({
    user: user || {},
    currentUserMedicalStoreId: meMedicalStoreId,
    medicalStoreNameById,
  });

  const companiesRaw = companiesData?.companies ?? [];
  const productsRaw = productsData?.products ?? [];
  const categoriesRaw = categoriesData?.categories ?? [];
  const billsRaw = billsData?.data ?? [];

  const companyMedicalStoreIdByCompanyId = buildCompanyMedicalStoreIdByCompanyId(
    companiesRaw,
    resolveStoreIdByUserId
  );

  const filteredCompanies = filterByMedicalStore(
    companiesRaw,
    effectiveMedicalStoreId,
    (company: any) =>
      getCompanyMedicalStoreIdForDashboard(company, resolveStoreIdByUserId)
  );

  const filteredProducts = filterByMedicalStore(
    productsRaw,
    effectiveMedicalStoreId,
    (product: any) =>
      getProductMedicalStoreIdForDashboard(
        product,
        resolveStoreIdByUserId,
        companyMedicalStoreIdByCompanyId
      )
  );

  const filteredCategories = filterByMedicalStore(
    categoriesRaw,
    effectiveMedicalStoreId,
    (category: any) =>
      getCategoryMedicalStoreIdForDashboard(category, resolveStoreIdByUserId)
  );

  const filteredUsers = filterByMedicalStore(
    usersRaw,
    effectiveMedicalStoreId,
    (targetUser: any) => getUserMedicalStoreId(targetUser)
  );

  const filteredBillsForStore = filterByMedicalStore(
    billsRaw,
    effectiveMedicalStoreId,
    (bill: any) =>
      getBillResolvedMedicalStoreIdForDashboard(bill, resolveStoreIdByUserId)
  );

  const medicalStores = medicalStoresData?.medicalStores ?? [];
  const scopedMedicalStores = effectiveMedicalStoreId
    ? medicalStores.filter(
        (store: any) => String(store?._id || "") === String(effectiveMedicalStoreId)
      )
    : medicalStores;

  return {
    user,
    isLoading,
    isAdmin,
    medicalStoreFilter,
    setMedicalStoreFilter,
    effectiveMedicalStoreId,
    currentUserMedicalStoreName,
    medicalStoreOptions,
    filteredCompanies,
    filteredProducts,
    filteredCategories,
    filteredUsers,
    filteredBillsForStore,
    scopedMedicalStores,
    companiesData,
    productsData,
    categoriesData,
    usersData,
    billsData,
    medicalStoresData,
    isDashboardFetching,
    refreshDashboardData,
  };
};
