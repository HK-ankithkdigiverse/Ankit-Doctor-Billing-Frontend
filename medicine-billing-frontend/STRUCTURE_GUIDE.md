# Folder Structure Guide

This guide follows the `library-management.zip` project style.

## Reference Structure (from zip)

```text
src/
  components/
    layout/
  Constants/
  hooks/
  pages/
    dashboard/
    books/
    members/
  router/
  services/
  store/
  types/
```

## Current Project Equivalent

```text
src/
  api/            -> API request layer (same role as services/api)
  components/
    layout/
  constants/
  hooks/
  pages/
  routers/
  services/
  store/
  types/
  utils/
  query/
```

## Recommended Pattern

1. Keep list APIs in two forms:
   - `getAllXApi()` for full dataset
   - `getXApi({ page, limit?, search?, sortBy?, sortOrder? })` for table pagination/filter/sort
2. Keep hooks in two forms:
   - `useAllX()` for dropdowns/forms
   - `useX(page, limit, search, ...)` for list pages
3. Keep page components lean:
   - fetch in hooks
   - mapping/sorting/filtering in `utils`
   - UI only in page/component
4. Keep React Query centralized:
   - `src/query/queryClient.ts` for client config
   - `src/query/queryKeys.ts` for all keys
   - hooks import `QUERY_KEYS` from `src/query`
5. Keep API imports centralized:
   - `src/api/index.ts` re-exports all API functions/types
   - pages/hooks/services import from `src/api` only
6. Keep Redux centralized:
   - `src/store/store.ts` for store setup
   - `src/store/rootReducer.ts` for reducer composition
   - `src/store/hooks.ts` for typed hooks
   - `src/store/slices/index.ts` re-exports slices/selectors/actions
   - consumers import Redux selectors/actions/hooks from `src/store`
