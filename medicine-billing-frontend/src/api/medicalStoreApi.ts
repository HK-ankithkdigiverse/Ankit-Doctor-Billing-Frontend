import { api } from "./axios";
import { buildPagedQueryParams, buildQueryParams, parseStatePagination } from "./pagination";
import { MEDICAL_STORES_API } from "../constants";
import type {
  GetMedicalStoresParams,
  GetMedicalStoresResponse,
  MedicalStorePayload,
} from "../types/api";

export type {
  GetMedicalStoresParams,
  GetMedicalStoresResponse,
  MedicalStorePayload,
} from "../types/api";

type GetAllMedicalStoresParams = Omit<
  GetMedicalStoresParams,
  "page" | "limit" | "search" | "sortBy" | "sortOrder"
>;

const toMedicalStoresResponse = (raw: any): GetMedicalStoresResponse => {
  const medicalStores = raw?.medicalStores || raw?.medicalStore_data || [];
  return {
    medicalStores,
    pagination: raw?.pagination || parseStatePagination(raw),
  };
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
