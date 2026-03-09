import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { isAllPageLimit } from "../utils/pagination";

export type QueryHookOptions = { enabled?: boolean };

const isObjectLike = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const parsePaginatedListArgs = <TOptions extends QueryHookOptions>(
  page?: number,
  limitOrSearch?: number | string,
  searchOrOptions: string | TOptions = "",
  optionsArg?: TOptions
) => {
  const rawLimit = typeof limitOrSearch === "number" ? limitOrSearch : undefined;
  const isAllSelected = isAllPageLimit(rawLimit);
  const limit = isAllSelected ? undefined : rawLimit;
  const search =
    typeof limitOrSearch === "string"
      ? limitOrSearch
      : typeof searchOrOptions === "string"
        ? searchOrOptions
        : "";
  const options =
    typeof searchOrOptions !== "string" && isObjectLike(searchOrOptions)
      ? searchOrOptions
      : optionsArg;

  return {
    isPaginated: typeof page === "number" && !isAllSelected,
    isAllSelected,
    limit,
    search,
    options,
  };
};

export const invalidateQueryKeys = (
  queryClient: QueryClient,
  ...queryKeys: QueryKey[]
) => {
  queryKeys.forEach((queryKey) => {
    void queryClient.invalidateQueries({ queryKey });
  });
};
