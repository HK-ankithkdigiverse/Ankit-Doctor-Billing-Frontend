import type { Category } from "./category";
import type { Company } from "./company";
import type { MedicalStore } from "./auth";

export interface PaginationShape {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ApiSortOrder = "asc" | "desc";

export interface GetProductsParams {
  page: number;
  limit?: number;
  category?: string;
  productType?: string;
  companyId?: string;
  medicalStoreId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: ApiSortOrder;
}

export interface GetCategoriesParams {
  page: number;
  limit?: number;
  search?: string;
  medicalStoreId?: string;
  sortBy?: string;
  sortOrder?: ApiSortOrder;
}

export interface GetCategoriesResponse {
  categories: Category[];
  pagination: PaginationShape;
}

export interface GetCompaniesParams {
  page: number;
  limit?: number;
  search?: string;
  medicalStoreId?: string;
  sortBy?: string;
  sortOrder?: ApiSortOrder;
}

export interface GetCompaniesResponse {
  companies: Company[];
  pagination: PaginationShape;
}

export interface GetMedicalStoresParams {
  page: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: ApiSortOrder;
}

export interface GetMedicalStoresResponse {
  medicalStores: MedicalStore[];
  pagination: PaginationShape;
}

export interface MedicalStorePayload {
  name: string;
  phone: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  gstNumber: string;
  panCardNumber: string;
  gstType: "IGST" | "CGST_SGST";
  isActive?: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  medicalStoreId?: string;
  role?: string;
  isActive?: boolean;
  signature?: string;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">>;

export interface GetUploadsParams {
  page?: number;
  limit?: number;
  type?: "image" | "pdf";
}

export interface GetUploadsResponse {
  files: string[];
  state: {
    page: number;
    limit: number;
    totalPages: number;
  };
  totalData: number;
}
