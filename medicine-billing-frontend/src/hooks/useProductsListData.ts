import { useCallback, useMemo, useState } from "react";
import type { Product } from "../types/product";
import { ROLE } from "../constants";
import { useDeleteProduct, useProducts } from "./useProducts";
import { useAllMedicalStores } from "./useMedicalStores";
import { useMe } from "./useMe";
import { useDebouncedValue } from "./useDebouncedValue";
import { useViewState } from "./useViewState";
import {
  buildMedicalStoreNameById,
  buildMedicalStoreOptions,
  getProductMedicalStoreId,
} from "../utils/medicalStore";
import { buildPageSizeSelectOptions, paginateByPage } from "../utils/pagination";
import {
  applyTableSort,
  createDateSorter,
  createNameSorter,
} from "../utils/tableSort";

export const useProductsListData = () => {
  const {
    view: { page, limit, search, medicalStoreId, sortField, sortOrder },
    setPagination,
    setSearch,
    setMedicalStoreId,
    setSort,
  } = useViewState("products");
  const debouncedSearch = useDebouncedValue(search, 500);
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const [shouldLoadMedicalStores, setShouldLoadMedicalStores] = useState(false);
  const hasAdminFilter = isAdmin && !!medicalStoreId;
  const canLoadMedicalStores = isAdmin && (hasAdminFilter || shouldLoadMedicalStores);
  const queryPage = hasAdminFilter ? 1 : page;
  const queryLimit = hasAdminFilter ? 1000 : limit;

  const { data, isPending, isFetching } = useProducts(queryPage, queryLimit, debouncedSearch);
  const { data: medicalStoresData } = useAllMedicalStores({
    enabled: canLoadMedicalStores,
  });
  const searchLoading = search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteProduct, isPending: deletePending } = useDeleteProduct();
  const productsRaw: Product[] = data?.products ?? [];
  const sortState = { field: sortField, order: sortOrder };

  const medicalStoreNameById = useMemo(
    () => buildMedicalStoreNameById(medicalStoresData?.medicalStores),
    [medicalStoresData?.medicalStores]
  );

  const getProductMedicalStoreName = (product: Product) => {
    if (typeof product.medicalStoreId === "object") {
      const storeName = product.medicalStoreId?.name?.trim();
      if (storeName) return storeName;
    }
    const targetMedicalStoreId = getProductMedicalStoreId(product);
    if (!targetMedicalStoreId) return "-";
    return medicalStoreNameById.get(targetMedicalStoreId) || targetMedicalStoreId;
  };

  const matchesAdminFilters = (product: Product) => {
    const storeId = getProductMedicalStoreId(product);
    return !medicalStoreId || storeId === medicalStoreId;
  };

  const filteredProducts: Product[] = isAdmin ? productsRaw.filter(matchesAdminFilters) : productsRaw;

  const objectIdToDate = (id?: string): Date | null => {
    if (!id || id.length < 8) return null;
    const epochSeconds = Number.parseInt(id.slice(0, 8), 16);
    if (!Number.isFinite(epochSeconds)) return null;
    const parsed = new Date(epochSeconds * 1000);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const pickProductDate = (product: Product, field: "created" | "updated"): string | Date | null => {
    const fallbackFromId = objectIdToDate(product._id);
    const candidates =
      field === "created"
        ? [product.createdAt, (product as any).createdDate, (product as any).date, fallbackFromId]
        : [
            product.updatedAt,
            (product as any).updatedDate,
            product.createdAt,
            (product as any).createdDate,
            fallbackFromId,
          ];
    const value = candidates.find((candidate) => {
      if (candidate instanceof Date) return !Number.isNaN(candidate.getTime());
      return candidate !== undefined && candidate !== null && String(candidate).trim() !== "";
    });
    return (value as string | Date | undefined) ?? null;
  };

  const sortedProducts = useMemo(
    () =>
      applyTableSort(filteredProducts, sortState, {
        name: createNameSorter((row: Product) => row.name),
        company: createNameSorter(
          (row: Product) => (row.companyId as any)?.companyName || (row.companyId as any)?.name || ""
        ),
        medicalStore: createNameSorter((row: Product) => getProductMedicalStoreName(row)),
        createdUpdatedAt: createDateSorter((row: Product) => pickProductDate(row, "updated")),
      }),
    [filteredProducts, medicalStoreNameById, sortField, sortOrder]
  );

  const products: Product[] = hasAdminFilter
    ? paginateByPage(sortedProducts, page, limit)
    : sortedProducts;
  const pagination = data?.pagination;
  const totalRecords = hasAdminFilter ? filteredProducts.length : pagination?.total || 0;
  const pageSizeSelectOptions = buildPageSizeSelectOptions(totalRecords);
  const medicalStoreOptions = useMemo(
    () =>
      buildMedicalStoreOptions(medicalStoresData?.medicalStores, {
        includeInactive: true,
        fallbackToId: true,
        sort: false,
      }),
    [medicalStoresData?.medicalStores]
  );
  const requestMedicalStoreOptions = useCallback(() => {
    setShouldLoadMedicalStores(true);
  }, []);

  return {
    isAdmin,
    page,
    limit,
    search,
    medicalStoreId,
    sortState,
    products,
    totalRecords,
    pageSizeSelectOptions,
    medicalStoreOptions,
    requestMedicalStoreOptions,
    searchLoading,
    isPending,
    deletePending,
    setPagination,
    setSearch,
    setMedicalStoreId,
    setSort,
    getProductMedicalStoreName,
    pickProductDate,
    deleteProduct,
  };
};
