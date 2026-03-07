import type { RootState } from "../../rootReducer";
import { createListFilterSlice } from "./createListFilterSlice";

const productFiltersSlice = createListFilterSlice("productFilters");

export const productFiltersActions = productFiltersSlice.actions;
export const selectProductFilters = (state: RootState) => state.listFilters.product;

export default productFiltersSlice.reducer;
