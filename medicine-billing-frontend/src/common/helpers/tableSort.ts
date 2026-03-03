const toSafeText = (value: unknown) => String(value ?? "").trim().toLowerCase();

const toSafeNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

type SortDateValue = string | Date | null | undefined;

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

