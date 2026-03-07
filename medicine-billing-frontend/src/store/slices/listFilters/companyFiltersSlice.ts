import type { RootState } from "../../rootReducer";
import { createListFilterSlice } from "./createListFilterSlice";

const companyFiltersSlice = createListFilterSlice("companyFilters");

export const companyFiltersActions = companyFiltersSlice.actions;
export const selectCompanyFilters = (state: RootState) => state.listFilters.company;

export default companyFiltersSlice.reducer;
