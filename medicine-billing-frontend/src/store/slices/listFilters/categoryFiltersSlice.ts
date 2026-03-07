import type { RootState } from "../../rootReducer";
import { createListFilterSlice } from "./createListFilterSlice";

const categoryFiltersSlice = createListFilterSlice("categoryFilters");

export const categoryFiltersActions = categoryFiltersSlice.actions;
export const selectCategoryFilters = (state: RootState) => state.listFilters.category;

export default categoryFiltersSlice.reducer;
