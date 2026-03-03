import { api } from "./axios";
import { dataOf } from "./http";
import { MEDICAL_STORES_API } from "../constants";
import type { MedicalStore } from "../types";

export interface GetMedicalStoresParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetMedicalStoresResponse {
  medicalStores: MedicalStore[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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

export const getMedicalStoresApi = (
  params: GetMedicalStoresParams
): Promise<GetMedicalStoresResponse> =>
  dataOf(api.get(MEDICAL_STORES_API.ROOT, { params }));

export const getMedicalStoreByIdApi = (
  id: string
): Promise<{ medicalStore: MedicalStore } | MedicalStore> =>
  dataOf(api.get(MEDICAL_STORES_API.BY_ID(id)));

export const createMedicalStoreApi = (
  payload: MedicalStorePayload
): Promise<{ message: string; medicalStore: MedicalStore }> =>
  dataOf(api.post(MEDICAL_STORES_API.ROOT, payload));

export const updateMedicalStoreApi = ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<MedicalStorePayload>;
}): Promise<{ message: string; medicalStore: MedicalStore }> =>
  dataOf(api.put(MEDICAL_STORES_API.BY_ID(id), payload));

export const deleteMedicalStoreApi = (id: string): Promise<{ message: string }> =>
  dataOf(api.delete(MEDICAL_STORES_API.BY_ID(id)));
