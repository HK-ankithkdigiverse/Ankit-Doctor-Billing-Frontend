import type { RootState } from "../../rootReducer";
import { createListFilterSlice } from "./createListFilterSlice";

const dashboardFiltersSlice = createListFilterSlice("dashboardFilters");

export const dashboardFiltersActions = dashboardFiltersSlice.actions;
export const selectDashboardFilters = (state: RootState) => state.listFilters.dashboard;

export default dashboardFiltersSlice.reducer;
