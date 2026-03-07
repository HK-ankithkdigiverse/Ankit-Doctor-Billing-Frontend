import { combineReducers } from "@reduxjs/toolkit";
import { authReducer, listFiltersReducer, uiReducer } from "./slices";

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  listFilters: listFiltersReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
