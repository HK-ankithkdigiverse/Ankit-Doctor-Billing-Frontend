import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAllBillsApi,
  getAllCategoriesApi,
  getAllCompaniesApi,
  getAllMedicalStoresApi,
  getAllProductsApi,
} from "../api/resourceApi";
import { getAllUsersApi } from "../api/userApi";
import { QUERY_KEYS, ROLE } from "../constants";
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
  const [medicalStoreFilter, setMedicalStoreFilter] = useState("");
  const { data: user, isLoading } = useMe();

  const isAdmin = user?.role === ROLE.ADMIN;
  const canLoadDashboardData = !isLoading && !!user;
  const meMedicalStoreId =
    toEntityId(user?.medicalStoreId) ||
    (typeof user?.medicineId === "string" ? user.medicineId : "");
  const effectiveMedicalStoreId = isAdmin ? medicalStoreFilter : meMedicalStoreId;
  const selectedMedicalStore = effectiveMedicalStoreId || "";

  const {
    data: billsData,
    refetch: refetchBills,
    isFetching: isBillsFetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.BILLS, "dashboard", selectedMedicalStore],
    queryFn: () =>
      getAllBillsApi({
        medicalStoreId: isAdmin ? selectedMedicalStore || undefined : undefined,
      }),
    enabled: canLoadDashboardData,
  });

  const {
    data: productsData,
    refetch: refetchProducts,
    isFetching: isProductsFetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "dashboard", selectedMedicalStore],
    queryFn: () =>
      getAllProductsApi({
        medicalStoreId: isAdmin ? selectedMedicalStore || undefined : undefined,
      }),
    enabled: canLoadDashboardData,
  });

  const {
    data: companiesData,
    refetch: refetchCompanies,
    isFetching: isCompaniesFetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.COMPANIES, "dashboard", selectedMedicalStore],
    queryFn: () =>
      getAllCompaniesApi({
        medicalStoreId: isAdmin ? selectedMedicalStore || undefined : undefined,
      }),
    enabled: canLoadDashboardData,
  });

  const {
    data: categoriesData,
    refetch: refetchCategories,
    isFetching: isCategoriesFetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, "dashboard", selectedMedicalStore],
    queryFn: () =>
      getAllCategoriesApi({
        medicalStoreId: isAdmin ? selectedMedicalStore || undefined : undefined,
      }),
    enabled: canLoadDashboardData,
  });

  const {
    data: usersData,
    refetch: refetchUsers,
    isFetching: isUsersFetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.USERS, "dashboard", selectedMedicalStore],
    queryFn: () => getAllUsersApi(),
    enabled: canLoadDashboardData && isAdmin,
  });

  const {
    data: medicalStoresData,
    refetch: refetchMedicalStores,
    isFetching: isMedicalStoresFetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.MEDICAL_STORES, "dashboard", selectedMedicalStore],
    queryFn: () => getAllMedicalStoresApi(),
    enabled: canLoadDashboardData && isAdmin,
  });

  const refreshDashboardData = useCallback(() => {
    const requests = [refetchCompanies(), refetchProducts(), refetchCategories(), refetchBills()];

    if (isAdmin) {
      requests.push(refetchUsers(), refetchMedicalStores());
    }

    void Promise.all(requests);
  }, [
    isAdmin,
    refetchCompanies,
    refetchProducts,
    refetchCategories,
    refetchBills,
    refetchUsers,
    refetchMedicalStores,
  ]);

  const isDashboardFetching =
    isCompaniesFetching ||
    isProductsFetching ||
    isCategoriesFetching ||
    isBillsFetching ||
    (isAdmin && (isUsersFetching || isMedicalStoresFetching));

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
        (store) => String(store?._id || "") === String(effectiveMedicalStoreId)
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
