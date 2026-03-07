const toSafeText = (value: unknown) => String(value ?? "").trim().toLowerCase();

const toSafeNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

type SortDateValue = string | Date | null | undefined;

export type TableSortOrder = "ascend" | "descend" | null;
export type TableSortState = {
  field: string;
  order: TableSortOrder;
};

const toSafeTime = (value?: SortDateValue) => {
  if (!value) return 0;
  const time = (value instanceof Date ? value : new Date(value)).getTime();
  return Number.isFinite(time) ? time : 0;
};

export const sortText = (left: unknown, right: unknown) =>
  toSafeText(left).localeCompare(toSafeText(right));

export const sortNumber = (left: unknown, right: unknown) =>
  toSafeNumber(left) - toSafeNumber(right);

export const sortDateTime = (left?: SortDateValue, right?: SortDateValue) =>
  toSafeTime(left) - toSafeTime(right);

export const createNameSorter = <TRow>(getValue: (row: TRow) => unknown) =>
  (left: TRow, right: TRow) => sortText(getValue(left), getValue(right));

export const createDateSorter = <TRow>(getValue: (row: TRow) => SortDateValue) =>
  (left: TRow, right: TRow) => sortDateTime(getValue(left), getValue(right));

export const getColumnSortOrder = (
  sortState: TableSortState,
  field: string
): TableSortOrder => (sortState.field === field ? sortState.order : null);

export const resolveTableSort = (sorter: unknown): TableSortState => {
  const resolved = Array.isArray(sorter) ? sorter[0] : sorter;

  if (!resolved || typeof resolved !== "object") {
    return { field: "", order: null };
  }

  const value = resolved as {
    field?: string;
    columnKey?: string;
    order?: TableSortOrder;
  };

  return {
    field: value.field || value.columnKey || "",
    order:
      value.order === "ascend" || value.order === "descend"
        ? value.order
        : null,
  };
};

export const applyTableSort = <TRow>(
  rows: TRow[],
  sortState: TableSortState,
  comparators: Record<string, (left: TRow, right: TRow) => number>
) => {
  if (!sortState.field || !sortState.order) return rows;

  const comparator = comparators[sortState.field];
  if (!comparator) return rows;

  const sorted = [...rows].sort(comparator);
  return sortState.order === "descend" ? sorted.reverse() : sorted;
};
