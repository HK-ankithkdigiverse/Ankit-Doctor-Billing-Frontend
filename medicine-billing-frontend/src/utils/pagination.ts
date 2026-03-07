export type PageSizeOption = {
  label: string;
  value: number;
};

const DEFAULT_PAGE_SIZES = [10, 30, 50, 100];

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
      ? [...baseOptions, { label: "All / page", value: totalRecords }]
      : baseOptions;
  const seen = new Set<number>();
  return options.filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
};
