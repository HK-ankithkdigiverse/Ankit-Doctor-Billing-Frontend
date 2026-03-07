import { combineReducers } from "@reduxjs/toolkit";
import companyFiltersReducer from "./companyFiltersSlice";
import productFiltersReducer from "./productFiltersSlice";
import categoryFiltersReducer from "./categoryFiltersSlice";
import billFiltersReducer from "./billFiltersSlice";
import medicalStoreFiltersReducer from "./medicalStoreFiltersSlice";
import userFiltersReducer from "./userFiltersSlice";
import dashboardFiltersReducer from "./dashboardFiltersSlice";

export const listFiltersReducer = combineReducers({
  company: companyFiltersReducer,
  product: productFiltersReducer,
  category: categoryFiltersReducer,
  bill: billFiltersReducer,
  medicalStore: medicalStoreFiltersReducer,
  user: userFiltersReducer,
  dashboard: dashboardFiltersReducer,
});

export type ListFiltersState = ReturnType<typeof listFiltersReducer>;

export { companyFiltersActions, selectCompanyFilters } from "./companyFiltersSlice";
export { productFiltersActions, selectProductFilters } from "./productFiltersSlice";
export { categoryFiltersActions, selectCategoryFilters } from "./categoryFiltersSlice";
export { billFiltersActions, selectBillFilters } from "./billFiltersSlice";
export { medicalStoreFiltersActions, selectMedicalStoreFilters } from "./medicalStoreFiltersSlice";
export { userFiltersActions, selectUserFilters } from "./userFiltersSlice";
export { dashboardFiltersActions, selectDashboardFilters } from "./dashboardFiltersSlice";
export type { ListFilterState } from "./createListFilterSlice";
