import {
  deserializeBillingDateRange,
  patchViewState,
  resetViewState,
  selectViewState,
  serializeBillingDateRange,
  useAppDispatch,
  useAppSelector,
  type ViewKey,
  type ViewSortOrder,
  type ViewState,
} from "../store";
import type { BillSortType, DateFilterType } from "../types/bill";
import type { BillingDateRange } from "../utils/billing";
import { isAllPageLimit } from "../utils/pagination";

export const useViewState = (key: ViewKey) => {
  const dispatch = useAppDispatch();
  const view = useAppSelector((state) => selectViewState(state, key));

  const patch = (changes: Partial<ViewState>) => {
    dispatch(patchViewState({ key, changes }));
  };

  return {
    view,
    customRange: deserializeBillingDateRange(view.customRange),
    setPage: (page: number) => patch({ page: isAllPageLimit(view.limit) ? 1 : page }),
    setLimit: (limit: number) => patch({ limit, page: 1 }),
    setPagination: (page: number, limit: number) =>
      patch({ page: isAllPageLimit(limit) ? 1 : page, limit }),
    setSearch: (search: string) => patch({ search, page: 1 }),
    setMedicalStoreId: (medicalStoreId: string) => patch({ medicalStoreId, page: 1 }),
    setStoreStatus: (storeStatus: ViewState["storeStatus"]) => patch({ storeStatus, page: 1 }),
    setUserStatus: (userStatus: ViewState["userStatus"]) => patch({ userStatus, page: 1 }),
    setDateFilter: (dateFilter: DateFilterType) =>
      patch({
        dateFilter,
        page: 1,
        ...(dateFilter === "custom" ? {} : { customRange: null }),
      }),
    setCustomRange: (customRange: BillingDateRange) =>
      patch({ customRange: serializeBillingDateRange(customRange), page: 1 }),
    setSort: (sortField: string, sortOrder: ViewSortOrder) =>
      patch({ sortField: sortOrder ? sortField : "", sortOrder }),
    setBillSort: (billSort: BillSortType) => patch({ billSort }),
    reset: () => dispatch(resetViewState(key)),
  };
};

