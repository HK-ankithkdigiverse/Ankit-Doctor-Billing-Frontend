import { useMemo } from "react";
import type { DashboardTotals } from "../api/resourceApi";

type DashboardStatsInput = {
  isAdmin: boolean;
  isScoped: boolean;
  filteredCompanies: any[];
  filteredProducts: any[];
  filteredCategories: any[];
  filteredUsers: any[];
  filteredBillsForStore: any[];
  scopedMedicalStores: any[];
  companiesTotal?: number;
  productsTotal?: number;
  categoriesTotal?: number;
  usersTotal?: number;
  billsTotal?: number;
  medicalStoresTotal?: number;
  dashboardTotals?: Partial<DashboardTotals>;
};

export const useDashboardStats = ({
  isAdmin,
  isScoped,
  filteredCompanies,
  filteredProducts,
  filteredCategories,
  filteredUsers,
  filteredBillsForStore,
  scopedMedicalStores,
  companiesTotal,
  productsTotal,
  categoriesTotal,
  usersTotal,
  billsTotal,
  medicalStoresTotal,
  dashboardTotals,
}: DashboardStatsInput) => {
  return useMemo(() => {
    const resolveScopedTotal = (filteredCount: number, total?: number) =>
      isScoped ? filteredCount : total && total > 0 ? total : filteredCount;

    const totalCompanies =
      typeof dashboardTotals?.totalCompanies === "number"
        ? dashboardTotals.totalCompanies
        : resolveScopedTotal(filteredCompanies.length, companiesTotal);
    const totalProducts =
      typeof dashboardTotals?.totalMedicines === "number"
        ? dashboardTotals.totalMedicines
        : resolveScopedTotal(filteredProducts.length, productsTotal);
    const totalCategories =
      typeof dashboardTotals?.totalCategories === "number"
        ? dashboardTotals.totalCategories
        : resolveScopedTotal(filteredCategories.length, categoriesTotal);
    const totalBills =
      typeof dashboardTotals?.totalBills === "number"
        ? dashboardTotals.totalBills
        : resolveScopedTotal(filteredBillsForStore.length, billsTotal);
    const totalUsers = isAdmin
      ? typeof dashboardTotals?.totalUsers === "number"
        ? dashboardTotals.totalUsers
        : resolveScopedTotal(filteredUsers.length, usersTotal)
      : 0;
    const totalMedicalStores = isAdmin
      ? typeof dashboardTotals?.totalMedicalStores === "number"
        ? dashboardTotals.totalMedicalStores
        : resolveScopedTotal(scopedMedicalStores.length, medicalStoresTotal)
      : 0;
    const filteredBillAmount = filteredBillsForStore.reduce(
      (sum: number, bill: any) =>
        sum + Number(bill?.totalAmount ?? bill?.grandTotal ?? 0),
      0
    );
    const totalBillAmount =
      typeof dashboardTotals?.totalBillAmount === "number"
        ? dashboardTotals.totalBillAmount
        : filteredBillAmount;

    const cards = isAdmin
      ? [
          { title: "Total Medical Stores", value: totalMedicalStores },
          { title: "Total Medicines", value: totalProducts },
          { title: "Total Companies", value: totalCompanies },
          { title: "Total Categories", value: totalCategories },
          { title: "Total Users", value: totalUsers },
          { title: "Total Bills", value: totalBills },
          { title: "Total Bill Amount", value: totalBillAmount, isCurrency: true },
        ]
      : [
          { title: "My Companies", value: totalCompanies },
          { title: "My Categories", value: totalCategories },
          { title: "My Bills", value: totalBills },
          { title: "My Bill Amount", value: totalBillAmount, isCurrency: true },
        ];

    return {
      totalCompanies,
      totalProducts,
      totalCategories,
      totalBills,
      totalUsers,
      totalMedicalStores,
      totalBillAmount,
      cards,
    };
  }, [
    isAdmin,
    isScoped,
    filteredCompanies,
    filteredProducts,
    filteredCategories,
    filteredUsers,
    filteredBillsForStore,
    scopedMedicalStores,
    companiesTotal,
    productsTotal,
    categoriesTotal,
    usersTotal,
    billsTotal,
    medicalStoresTotal,
    dashboardTotals,
  ]);
};
