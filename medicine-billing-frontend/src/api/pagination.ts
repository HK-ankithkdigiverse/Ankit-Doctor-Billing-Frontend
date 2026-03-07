import type { PaginationShape } from "../types/api";

const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const asInt = Math.trunc(parsed);
  return asInt > 0 ? asInt : fallback;
};

const toPositiveIntOrUndefined = (value: unknown): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  const asInt = Math.trunc(parsed);
  return asInt > 0 ? asInt : undefined;
};

const toNonEmptyTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

type PagedQueryParams = {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
};

export const buildQueryParams = <T extends Record<string, unknown>>(params?: T) => {
  const source = (params ?? {}) as T;
  const query: Record<string, unknown> = {};

  (Object.keys(source) as Array<Extract<keyof T, string>>).forEach((key) => {
    const value = source[key];
    if (value === undefined || value === null) return;

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return;
      query[key] = trimmed;
      return;
    }

    query[key] = value;
  });

  return query as Partial<T>;
};

export const buildPagedQueryParams = <T extends PagedQueryParams>(params?: T) => {
  const source = (params ?? {}) as T;
  const query: Record<string, unknown> = {
    ...buildQueryParams(source),
    page: toPositiveInt(source.page, 1),
  };
  delete query.limit;
  delete query.search;

  const limit = toPositiveIntOrUndefined(source.limit);
  if (limit !== undefined) query.limit = limit;

  const search = toNonEmptyTrimmedString(source.search);
  if (search !== undefined) query.search = search;

  return query as { page: number } & Partial<T>;
};

export const parseStatePagination = (raw: any): PaginationShape => {
  const total = toPositiveInt(raw?.pagination?.total ?? raw?.totalData, 0);
  const page = toPositiveInt(raw?.pagination?.page ?? raw?.state?.page, 1);
  const limit = toPositiveInt(raw?.pagination?.limit ?? raw?.state?.limit, total || 1);
  const totalPages = toPositiveInt(
    raw?.pagination?.totalPages ??
      raw?.pagination?.page_limit ??
      raw?.state?.page_limit ??
      Math.ceil(total / limit),
    1
  );

  return {
    total,
    page,
    limit,
    totalPages,
  };
};
