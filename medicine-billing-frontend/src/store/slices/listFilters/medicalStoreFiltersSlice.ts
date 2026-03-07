import type { RootState } from "../../rootReducer";
import { createListFilterSlice } from "./createListFilterSlice";

const medicalStoreFiltersSlice = createListFilterSlice("medicalStoreFilters");

export const medicalStoreFiltersActions = medicalStoreFiltersSlice.actions;
export const selectMedicalStoreFilters = (state: RootState) =>
  state.listFilters.medicalStore;

export default medicalStoreFiltersSlice.reducer;
