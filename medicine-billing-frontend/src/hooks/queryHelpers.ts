import type { QueryClient, QueryKey } from "@tanstack/react-query";

export type QueryHookOptions = { enabled?: boolean };

const isObjectLike = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const parsePaginatedListArgs = <TOptions extends QueryHookOptions>(
  page?: number,
  limitOrSearch?: number | string,
  searchOrOptions: string | TOptions = "",
  optionsArg?: TOptions
) => {
  const limit = typeof limitOrSearch === "number" ? limitOrSearch : undefined;
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
    isPaginated: typeof page === "number",
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
