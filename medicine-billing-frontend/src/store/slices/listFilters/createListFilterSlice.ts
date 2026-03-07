import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ListFilterState {
  page: number;
  limit?: number;
  search: string;
}

export const createListFilterInitialState = (
  overrides: Partial<ListFilterState> = {}
): ListFilterState => ({
  page: 1,
  limit: 10,
  search: "",
  ...overrides,
});

export const createListFilterSlice = (
  name: string,
  overrides: Partial<ListFilterState> = {}
) =>
  createSlice({
    name,
    initialState: createListFilterInitialState(overrides),
    reducers: {
      setPage: (state, action: PayloadAction<number>) => {
        state.page = action.payload;
      },
      setLimit: (state, action: PayloadAction<number | undefined>) => {
        state.limit = action.payload;
        state.page = 1;
      },
      setSearch: (state, action: PayloadAction<string>) => {
        state.search = action.payload;
        state.page = 1;
      },
      resetFilters: (state) => {
        state.page = 1;
        state.limit = overrides.limit ?? 10;
        state.search = "";
      },
    },
  });
