import { USERS_API } from "../constants";
import { api } from "./axios";
import type { User } from "../types";

export interface CreateUserPayload {
  name: string;
  medicalName?: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panCardNumber?: string;
  role?: string;
  isActive?: boolean;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">>;

export interface GetUsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getAllUsersApi = async ({
  page,
  limit,
  search,
  isActive,
}: {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}): Promise<GetUsersResponse> => {
  const res = await api.get(USERS_API.ROOT, {
    params: {
      page,
      limit,
      search,
      ...(typeof isActive === "boolean" ? { isActive } : {}),
    },
  });

  return res.data;
};

export const updateUserApi = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateUserPayload;
}) => {
  const res = await api.put(USERS_API.BY_ID(id), data);
  return res.data;
};

export const deleteUserApi = async (id: string) => {
  const res = await api.delete(USERS_API.BY_ID(id));
  return res.data;
};

export const getProfileApi = async () => {
  const res = await api.get(USERS_API.ME);
  return res.data.user as User;
};

// UPDATE PROFILE
export const updateProfileApi = async (data: {
  name: string;
  medicalName?: string;
  email: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panCardNumber?: string;
}) => {
  const res = await api.put(USERS_API.ME, data);
  return res.data.user as User;
};

// DELETE ACCOUNT
export const deleteAccountApi = async () => {
  const res = await api.delete(USERS_API.ME);
  return res.data;
};

// ADMIN CREATE USER
export const createUserApi = async (data: CreateUserPayload) => {
  const res = await api.post(USERS_API.ROOT, data);
  return res.data;
};

// CHANGE PASSWORD
export const changePasswordApi = async (data: {
  oldPassword: string;
  newPassword: string;
}) => {
  const res = await api.put(USERS_API.ME_PASSWORD, data);
  return res.data;
};

