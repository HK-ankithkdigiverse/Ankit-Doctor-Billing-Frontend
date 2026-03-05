export const getSerialNumber = (page: number, limit: number, index: number) =>
  (Math.max(page, 1) - 1) * Math.max(limit, 1) + index + 1;

export const paginateByPage = <T>(items: T[], page: number, limit: number) => {
  const safeLimit = Math.max(limit, 1);
  const start = (Math.max(page, 1) - 1) * safeLimit;
  return items.slice(start, start + safeLimit);
};

