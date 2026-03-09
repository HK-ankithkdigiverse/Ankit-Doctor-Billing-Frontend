import { api } from "./axios";
import {
  buildPagedQueryParams,
  buildQueryParams,
  parseStatePagination,
} from "./pagination";
import {
  BILLS_API,
  CATEGORIES_API,
  COMPANIES_API,
  MEDICAL_STORES_API,
  PRODUCTS_API,
} from "../constants";
import type {
  ApiSortOrder,
  GetCategoriesParams,
  GetCategoriesResponse,
  GetCompaniesParams,
  GetMedicalStoresParams,
  GetMedicalStoresResponse,
  GetProductsParams,
  MedicalStorePayload,
} from "../types/api";
import type { BillPayload, BillUpdatePayload } from "../types/bill";
import type {
  CategoryDropdownItem,
  CreateCategoryPayload,
} from "../types/category";

export type {
  GetCategoriesParams,
  GetCategoriesResponse,
  GetMedicalStoresParams,
  GetMedicalStoresResponse,
  GetProductsParams,
  MedicalStorePayload,
} from "../types/api";

export type GetBillsParams = {
  page: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: ApiSortOrder;
  medicalStoreId?: string;
};

export type GetAllBillsParams = Omit<
  GetBillsParams,
  "page" | "limit" | "search" | "sortBy" | "sortOrder"
>;

type GetAllCategoriesParams = Omit<
  GetCategoriesParams,
  "page" | "limit" | "search" | "sortBy" | "sortOrder"
>;

type GetAllCompaniesParams = Omit<
  GetCompaniesParams,
  "page" | "limit" | "search" | "sortBy" | "sortOrder"
>;

type GetAllMedicalStoresParams = Omit<
  GetMedicalStoresParams,
  "page" | "limit" | "search" | "sortBy" | "sortOrder"
>;

type GetAllProductsParams = Omit<
  GetProductsParams,
  "page" | "limit" | "search" | "sortBy" | "sortOrder"
>;

const toBillsResponse = (raw: any) => {
  const bills = raw?.data || raw?.bills || raw?.bill_data || [];
  return {
    ...raw,
    data: bills,
    bills,
    pagination: raw?.pagination || parseStatePagination(raw),
  };
};

const toCategoriesResponse = (raw: any): GetCategoriesResponse => {
  const categories = raw?.categories || raw?.category_data || [];
  return {
    categories,
    pagination: raw?.pagination || parseStatePagination(raw),
  };
};

const toCompaniesResponse = (raw: any) => {
  const companies = raw?.companies || raw?.company_data || [];
  return {
    ...raw,
    companies,
    pagination: raw?.pagination || parseStatePagination(raw),
  };
};

const toMedicalStoresResponse = (raw: any): GetMedicalStoresResponse => {
  const medicalStores = raw?.medicalStores || raw?.medicalStore_data || [];
  return {
    medicalStores,
    pagination: raw?.pagination || parseStatePagination(raw),
  };
};

const toProductsResponse = (raw: any) => {
  const products = raw?.products || raw?.product_data || raw?.data || [];
  return {
    ...raw,
    products,
    pagination: raw?.pagination || parseStatePagination(raw),
  };
};

export const getBillsApi = async (params: GetBillsParams) => {
  const { data } = await api.get(BILLS_API.ROOT, {
    params: buildPagedQueryParams(params),
  });
  return toBillsResponse(data);
};

export const getAllBillsApi = async (params?: GetAllBillsParams) => {
  const { data } = await api.get(BILLS_API.ROOT, {
    params: buildQueryParams(params),
  });
  return toBillsResponse(data);
};

export const getBillByIdApi = async (id: string) => {
  const { data } = await api.get(BILLS_API.BY_ID(id));
  return data;
};

export const createBillApi = async (payload: BillPayload) => {
  const { data } = await api.post(BILLS_API.ROOT, payload);
  return data;
};

export const updateBillApi = async ({
  id,
  payload,
}: {
  id: string;
  payload: BillUpdatePayload;
}) => {
  const { data } = await api.put(BILLS_API.BY_ID(id), payload);
  return data;
};

export const deleteBillApi = async (id: string) => {
  const { data } = await api.delete(BILLS_API.BY_ID(id));
  return data;
};

export const getCategoriesApi = async (params: GetCategoriesParams) => {
  const { data } = await api.get(CATEGORIES_API.ROOT, {
    params: buildPagedQueryParams(params),
  });
  return toCategoriesResponse(data);
};

export const getAllCategoriesApi = async (params?: GetAllCategoriesParams) => {
  const { data } = await api.get(CATEGORIES_API.ROOT, {
    params: buildQueryParams(params),
  });
  return toCategoriesResponse(data);
};

export const getCategoryByIdApi = async (id: string) => {
  const { data } = await api.get(CATEGORIES_API.BY_ID(id));
  return data;
};

export const createCategoryApi = async (payload: CreateCategoryPayload) => {
  const { data } = await api.post(CATEGORIES_API.ROOT, payload);
  return data;
};

export const updateCategoryApi = async ({
  id,
  payload,
}: {
  id: string;
  payload: CreateCategoryPayload;
}) => {
  const { data } = await api.put(CATEGORIES_API.BY_ID(id), payload);
  return data;
};

export const deleteCategoryApi = async (id: string) => {
  const { data } = await api.delete(CATEGORIES_API.BY_ID(id));
  return data;
};

export const getCategoryDropdownApi = async (): Promise<CategoryDropdownItem[]> => {
  const { data } = await api.get(CATEGORIES_API.DROPDOWN);
  return data?.categories || data || [];
};

export const getCompaniesApi = async (params: GetCompaniesParams) => {
  const { data } = await api.get(COMPANIES_API.ROOT, {
    params: buildPagedQueryParams(params),
  });
  return toCompaniesResponse(data);
};

export const getAllCompaniesApi = async (params?: GetAllCompaniesParams) => {
  const { data } = await api.get(COMPANIES_API.ROOT, {
    params: buildQueryParams(params),
  });
  return toCompaniesResponse(data);
};

export const getCompanyByIdApi = async (id: string) => {
  const { data } = await api.get(COMPANIES_API.BY_ID(id));
  return data;
};

export const createCompanyApi = async (payload: FormData) => {
  const { data } = await api.post(COMPANIES_API.ROOT, payload);
  return data;
};

export const updateCompanyApi = async (id: string, payload: FormData) => {
  const { data } = await api.put(COMPANIES_API.BY_ID(id), payload);
  return data;
};

export const deleteCompanyApi = async (id: string) => {
  const { data } = await api.delete(COMPANIES_API.BY_ID(id));
  return data;
};

export const getMedicalStoresApi = async (params: GetMedicalStoresParams) => {
  const { data } = await api.get(MEDICAL_STORES_API.ROOT, {
    params: buildPagedQueryParams(params),
  });
  return toMedicalStoresResponse(data);
};

export const getAllMedicalStoresApi = async (params?: GetAllMedicalStoresParams) => {
  const { data } = await api.get(MEDICAL_STORES_API.ROOT, {
    params: buildQueryParams(params),
  });
  return toMedicalStoresResponse(data);
};

export const getMedicalStoreByIdApi = async (id: string) => {
  const { data } = await api.get(MEDICAL_STORES_API.BY_ID(id));
  return data;
};

export const createMedicalStoreApi = async (payload: MedicalStorePayload) => {
  const { data } = await api.post(MEDICAL_STORES_API.ROOT, payload);
  return data;
};

export const updateMedicalStoreApi = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<MedicalStorePayload>;
}) => {
  const { data } = await api.put(MEDICAL_STORES_API.BY_ID(id), payload);
  return data;
};

export const deleteMedicalStoreApi = async (id: string) => {
  const { data } = await api.delete(MEDICAL_STORES_API.BY_ID(id));
  return data;
};

export const getProductsApi = async (params: GetProductsParams) => {
  const { data } = await api.get(PRODUCTS_API.ROOT, {
    params: buildPagedQueryParams(params),
  });
  return toProductsResponse(data);
};

export const getAllProductsApi = async (params?: GetAllProductsParams) => {
  const { data } = await api.get(PRODUCTS_API.ROOT, {
    params: buildQueryParams(params),
  });
  return toProductsResponse(data);
};

export const getProductByIdApi = async (id: string) => {
  const { data } = await api.get(PRODUCTS_API.BY_ID(id));
  return data?.product || data;
};

export const createProductApi = async (payload: any) => {
  const { data } = await api.post(PRODUCTS_API.ROOT, payload);
  return data;
};

export const updateProductApi = async ({
  id,
  data: payload,
}: {
  id: string;
  data: any;
}) => {
  const { data } = await api.put(PRODUCTS_API.BY_ID(id), payload);
  return data;
};

export const deleteProductApi = async (id: string) => {
  const { data } = await api.delete(PRODUCTS_API.BY_ID(id));
  return data;
};

export const searchProductsApi = async (search: string) => {
  const response = await getProductsApi({ page: 1, search });
  return response?.products || [];
};

export type DashboardTotals = {
  totalMedicalStores: number;
  totalMedicines: number;
  totalCompanies: number;
  totalCategories: number;
  totalUsers: number;
  totalBills: number;
  totalBillAmount: number;
};

export type DashboardSelectedBill = {
  _id?: string;
  billNo?: string;
  company?: string;
  totalAmount?: number;
  createdAt?: string;
};

export type DashboardSelectedBillsResponse = {
  bill_data: DashboardSelectedBill[];
  totalData: number;
  state: {
    page: number;
    limit: number;
    page_limit: number;
  };
};

export type GetDashboardParams = {
  search?: string;
  companyId?: string;
  medicalStoreId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type DashboardResponse = {
  dashboard: DashboardTotals;
  billsBySelectedFilters: DashboardSelectedBillsResponse;
};

const toNonNegativeNumber = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const toPositiveInt = (value: unknown, fallback = 1) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const asInt = Math.trunc(parsed);
  return asInt > 0 ? asInt : fallback;
};

const normalizeDashboardBillsBySelectedFilters = (
  raw: any
): DashboardSelectedBillsResponse => {
  const rows = Array.isArray(raw?.bill_data) ? raw.bill_data : [];
  const page = toPositiveInt(raw?.state?.page, 1);
  const limit = toPositiveInt(raw?.state?.limit, 10);
  const pageLimit = toPositiveInt(
    raw?.state?.page_limit,
    Math.max(1, Math.ceil(toNonNegativeNumber(raw?.totalData) / limit))
  );

  return {
    bill_data: rows.map((row: any) => ({
      _id: typeof row?._id === "string" ? row._id : "",
      billNo: typeof row?.billNo === "string" ? row.billNo : "",
      company: typeof row?.company === "string" ? row.company : "",
      totalAmount: toNonNegativeNumber(row?.totalAmount),
      createdAt: typeof row?.createdAt === "string" ? row.createdAt : "",
    })),
    totalData: toNonNegativeNumber(raw?.totalData),
    state: {
      page,
      limit,
      page_limit: pageLimit,
    },
  };
};

const normalizeDashboardResponse = (raw: any): DashboardResponse => {
  const payload = raw && typeof raw === "object" ? raw : {};
  const source =
    payload?.dashboard && typeof payload.dashboard === "object"
      ? payload.dashboard
      : payload;
  if (!source || typeof source !== "object") {
    throw new Error("Invalid dashboard response");
  }

  return {
    dashboard: {
      totalMedicalStores: toNonNegativeNumber(source.totalMedicalStores),
      totalMedicines: toNonNegativeNumber(source.totalMedicines),
      totalCompanies: toNonNegativeNumber(source.totalCompanies),
      totalCategories: toNonNegativeNumber(source.totalCategories),
      totalUsers: toNonNegativeNumber(source.totalUsers),
      totalBills: toNonNegativeNumber(source.totalBills),
      totalBillAmount: toNonNegativeNumber(source.totalBillAmount),
    },
    billsBySelectedFilters: normalizeDashboardBillsBySelectedFilters(
      payload?.billsBySelectedFilters
    ),
  };
};

export const getDashboardApi = async (params?: GetDashboardParams) => {
  const { data } = await api.get("/dashboard", {
    params: buildQueryParams(params),
  });
  return normalizeDashboardResponse(data);
};

export const getDashboardSummaryApi = async (params?: { medicalStoreId?: string }) => {
  const { data } = await api.get("/dashboard-summary", {
    baseURL: "",
    params: buildQueryParams(params),
  });

  const isSummaryResponse =
    data &&
    typeof data === "object" &&
    "bills" in data &&
    "products" in data &&
    "companies" in data &&
    "categories" in data &&
    "users" in data &&
    "medicalStores" in data;

  if (!isSummaryResponse) {
    throw new Error("Invalid dashboard summary response");
  }

  return data as {
    bills: any;
    products: any;
    companies: any;
    categories: any;
    users: any;
    medicalStores: any;
  };
};
