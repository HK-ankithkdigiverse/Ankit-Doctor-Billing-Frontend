import { USERS_API } from "../constants";
import type { User } from "../types";
import { api } from "./axios";
import { dataOf } from "./http";

export interface CreateUserPayload {
  name: string;
  medicalName: string;
  email: string;
  password: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  gstNumber: string;
  panCardNumber: string;
  signature?: string;
  phone?: string;
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

export const getAllUsersApi = ({
  page,
  limit,
  search,
  isActive,
}: {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}): Promise<GetUsersResponse> =>
  dataOf(
    api.get(USERS_API.ROOT, {
      params: {
        page,
        limit,
        search,
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
    })
  );

export const updateUserApi = ({ id, data }: { id: string; data: UpdateUserPayload }) =>
  dataOf(api.put(USERS_API.BY_ID(id), data));

export const deleteUserApi = (id: string) => dataOf(api.delete(USERS_API.BY_ID(id)));

export const getProfileApi = () =>
  dataOf<{ user: User }>(api.get(USERS_API.ME)).then((data) => data.user);

export const updateProfileApi = (data: {
  name: string;
  medicalName?: string;
  email: string;
  signature?: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panCardNumber?: string;
}) =>
  dataOf<{ user: User }>(api.put(USERS_API.ME, data)).then((res) => res.user);

export const createUserApi = (data: CreateUserPayload) =>
  dataOf(api.post(USERS_API.ROOT, data));

export const changePasswordApi = (data: { oldPassword: string; newPassword: string }) =>
  dataOf(api.put(USERS_API.ME_PASSWORD, data));
