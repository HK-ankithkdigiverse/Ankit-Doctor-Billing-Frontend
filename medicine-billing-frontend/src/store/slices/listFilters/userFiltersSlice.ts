import type { RootState } from "../../rootReducer";
import { createListFilterSlice } from "./createListFilterSlice";

const userFiltersSlice = createListFilterSlice("userFilters");

export const userFiltersActions = userFiltersSlice.actions;
export const selectUserFilters = (state: RootState) => state.listFilters.user;

export default userFiltersSlice.reducer;
