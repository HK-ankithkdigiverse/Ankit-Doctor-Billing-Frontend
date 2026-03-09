export type PageSizeOption = {
  label: string;
  value: number;
};

const DEFAULT_PAGE_SIZES = [10, 30, 50, 100];
export const ALL_PAGE_SIZE = Number.MAX_SAFE_INTEGER;

export const isAllPageLimit = (limit: unknown) => Number(limit) === ALL_PAGE_SIZE;

export const getSerialNumber = (page: number, limit: number, index: number) =>
  (Math.max(page, 1) - 1) * Math.max(limit, 1) + index + 1;

export const paginateByPage = <T>(items: T[], page: number, limit: number) => {
  const safeLimit = Math.max(limit, 1);
  const start = (Math.max(page, 1) - 1) * safeLimit;
  return items.slice(start, start + safeLimit);
};

export const buildPageSizeSelectOptions = (
  totalRecords: number,
  pageSizes: number[] = DEFAULT_PAGE_SIZES
): PageSizeOption[] => {
  const baseOptions = pageSizes.map((size) => ({
    label: `${size} / page`,
    value: size,
  }));
  const options =
    totalRecords > 0
      ? [...baseOptions, { label: "All", value: ALL_PAGE_SIZE }]
      : baseOptions;
  const seen = new Set<number>();
  return options.filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
};

export const resolvePaginationPageSize = (
  limit: number,
  totalRecords: number,
  fallback = 10
) => {
  if (isAllPageLimit(limit)) return ALL_PAGE_SIZE;
  const safeFallback = Math.max(fallback, 1);
  return Math.max(limit || totalRecords || safeFallback, 1);
};
