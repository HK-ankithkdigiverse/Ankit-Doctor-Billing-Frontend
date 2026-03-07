import { api } from "./axios";
import { buildPagedQueryParams, buildQueryParams, parseStatePagination } from "./pagination";
import { USERS_API } from "../constants";
import type { ApiSortOrder, CreateUserPayload, UpdateUserPayload } from "../types/api";
import { clean, lower } from "../utils/common";
import { extractMedicalStoreId, normalizeUser } from "../services/normalizers/userNormalizer";

export type { CreateUserPayload, UpdateUserPayload } from "../types/api";

export type GetUsersParams = {
  page: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: ApiSortOrder;
  isActive?: boolean;
};

export type GetAllUsersParams = Omit<
  GetUsersParams,
  "page" | "limit" | "search" | "sortBy" | "sortOrder"
>;

const toUsersResponse = (raw: any) => {
  const users = Array.isArray(raw?.users)
    ? raw.users
    : Array.isArray(raw?.user_data)
      ? raw.user_data
      : [];

  return {
    ...raw,
    users: users.map(normalizeUser),
    pagination: raw?.pagination || parseStatePagination(raw),
  };
};

export const getUsersApi = async (params: GetUsersParams) => {
  const { data } = await api.get(USERS_API.ROOT, {
    params: buildPagedQueryParams(params),
  });
  return toUsersResponse(data);
};

export const getAllUsersApi = async (params?: GetAllUsersParams) => {
  const { data } = await api.get(USERS_API.ROOT, {
    params: buildQueryParams(params),
  });
  return toUsersResponse(data);
};

export const createUserApi = async (payload: CreateUserPayload) => {
  const medicalStoreId = extractMedicalStoreId(payload);
  if (!medicalStoreId && payload.role?.toUpperCase() !== "ADMIN") {
    throw new Error("Medical Store ID required.");
  }

  const requestData = {
    name: clean(payload.name) || "",
    email: lower(payload.email) || "",
    password: clean(payload.password) || "",
    role: clean(payload.role),
    isActive: payload.isActive,
    signature: clean(payload.signature),
    ...(medicalStoreId && { medicalStoreId }),
  };

  const { data } = await api.post(USERS_API.ROOT, requestData);
  return data?.user ? { ...data, user: normalizeUser(data.user) } : data;
};

export const updateUserApi = async (id: string, payload: UpdateUserPayload) => {
  const medicalStoreId = extractMedicalStoreId(payload);
  const requestData = {
    ...(clean(payload.name) && { name: clean(payload.name) }),
    ...(clean(payload.email) && { email: lower(payload.email) }),
    ...(clean(payload.role) && { role: clean(payload.role) }),
    ...(typeof payload.isActive === "boolean" && { isActive: payload.isActive }),
    ...(payload.signature !== undefined && { signature: clean(payload.signature) || "" }),
    ...(medicalStoreId && { medicalStoreId }),
  };

  const { data } = await api.put(USERS_API.BY_ID(id), requestData);
  return data?.user ? { ...data, user: normalizeUser(data.user) } : data;
};

export const deleteUserApi = async (id: string) => {
  const { data } = await api.delete(USERS_API.BY_ID(id));
  return data;
};

export const getProfileApi = async () => {
  const { data } = await api.get(USERS_API.ME);
  return normalizeUser(data?.user ?? data);
};

export const updateProfileApi = async (payload: {
  name: string;
  email: string;
  signature?: string;
}) => {
  const requestData = {
    name: clean(payload.name) || "",
    email: lower(payload.email) || "",
    ...(payload.signature !== undefined && { signature: clean(payload.signature) || "" }),
  };

  const { data } = await api.put(USERS_API.ME, requestData);
  return normalizeUser(data?.user ?? data);
};

export const changePasswordApi = async (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  const { data } = await api.put(USERS_API.ME_PASSWORD, payload);
  return data;
};
