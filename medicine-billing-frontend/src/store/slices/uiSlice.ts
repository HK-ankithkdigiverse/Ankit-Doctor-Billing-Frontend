import dayjs from "dayjs";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BillSortType, DateFilterType } from "../../types/bill";
import type { RootState } from "../rootReducer";
import type { BillingDateRange } from "../../utils/billing";

export type ViewSortOrder = "ascend" | "descend" | null;
export type SerializedDateRange = {
  start: string | null;
  end: string | null;
} | null;

export type ViewState = {
  page: number;
  limit: number;
  search: string;
  medicalStoreId: string;
  storeStatus: "all" | "active" | "inactive";
  userStatus: "active" | "inactive";
  dateFilter: DateFilterType;
  customRange: SerializedDateRange;
  sortField: string;
  sortOrder: ViewSortOrder;
  billSort: BillSortType;
};

export type ViewKey =
  | "products"
  | "companies"
  | "categories"
  | "bills"
  | "medicalStores"
  | "users"
  | "dashboard";

type UIState = Record<ViewKey, ViewState>;

const createViewState = (overrides: Partial<ViewState> = {}): ViewState => ({
  page: 1,
  limit: 10,
  search: "",
  medicalStoreId: "",
  storeStatus: "all",
  userStatus: "active",
  dateFilter: "all",
  customRange: null,
  sortField: "",
  sortOrder: null,
  billSort: "newest",
  ...overrides,
});

const defaults: UIState = {
  products: createViewState(),
  companies: createViewState(),
  categories: createViewState(),
  bills: createViewState(),
  medicalStores: createViewState(),
  users: createViewState(),
  dashboard: createViewState(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState: defaults,
  reducers: {
    patchViewState(
      state,
      action: PayloadAction<{ key: ViewKey; changes: Partial<ViewState> }>
    ) {
      Object.assign(state[action.payload.key], action.payload.changes);
    },
    resetViewState(state, action: PayloadAction<ViewKey>) {
      state[action.payload] = { ...defaults[action.payload] };
    },
  },
});

export const serializeBillingDateRange = (
  customRange: BillingDateRange
): SerializedDateRange => {
  const start = customRange?.[0]?.toISOString() ?? null;
  const end = customRange?.[1]?.toISOString() ?? null;

  if (!start && !end) return null;

  return { start, end };
};

export const deserializeBillingDateRange = (
  customRange: SerializedDateRange
): BillingDateRange => {
  if (!customRange?.start && !customRange?.end) return null;

  return [
    customRange?.start ? dayjs(customRange.start) : null,
    customRange?.end ? dayjs(customRange.end) : null,
  ];
};

export const { patchViewState, resetViewState } = uiSlice.actions;

export const selectViewState = (state: RootState, key: ViewKey) => state.ui[key];

export default uiSlice.reducer;
