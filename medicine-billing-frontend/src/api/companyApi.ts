import { api } from "./axios";
import { buildPagedQueryParams, buildQueryParams, parseStatePagination } from "./pagination";
import { COMPANIES_API } from "../constants";
import type { GetCompaniesParams } from "../types/api";

type GetAllCompaniesParams = Omit<GetCompaniesParams, "page" | "limit" | "search" | "sortBy" | "sortOrder">;

const toCompaniesResponse = (raw: any) => {
  const companies = raw?.companies || raw?.company_data || [];
  return {
    ...raw,
    companies,
    pagination: raw?.pagination || parseStatePagination(raw),
  };
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
