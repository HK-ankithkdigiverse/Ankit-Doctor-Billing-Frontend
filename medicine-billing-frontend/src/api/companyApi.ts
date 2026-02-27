import { api } from "./axios";
import { dataOf } from "./http";
import { COMPANIES_API } from "../constants";
import type { Company } from "../types/company";

export interface GetCompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetCompaniesResponse {
  companies: Company[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getCompaniesApi = (params: GetCompaniesParams): Promise<GetCompaniesResponse> =>
  dataOf(
    api.get(COMPANIES_API.ROOT, {
      params,
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })
  );

export const getCompanyByIdApi = (id: string): Promise<{ company: Company } | Company> =>
  dataOf(api.get(COMPANIES_API.BY_ID(id)));

export const createCompanyApi = (formData: FormData) =>
  dataOf(api.post(COMPANIES_API.ROOT, formData));

export const updateCompanyApi = ({
  id,
  formData,
}: {
  id: string;
  formData: FormData;
}) => dataOf(api.put(COMPANIES_API.BY_ID(id), formData));

export const deleteCompanyApi = (id: string) =>
  dataOf(api.delete(COMPANIES_API.BY_ID(id)));
