import type { RootState } from "../../rootReducer";
import { createListFilterSlice } from "./createListFilterSlice";

const billFiltersSlice = createListFilterSlice("billFilters");

export const billFiltersActions = billFiltersSlice.actions;
export const selectBillFilters = (state: RootState) => state.listFilters.bill;

export default billFiltersSlice.reducer;
