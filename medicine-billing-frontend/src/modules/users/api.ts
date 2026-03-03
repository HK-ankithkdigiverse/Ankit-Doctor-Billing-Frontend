import { MEDICAL_STORES_API, USERS_API } from "../../constants";
import type { User } from "../../types";
import { api } from "../../common/services/apiClient";
import { dataOf } from "../../common/services/httpService";

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const isObjectId = (v?: unknown): v is string =>
  typeof v === "string" && OBJECT_ID_REGEX.test(v);

const clean = (v?: unknown) =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

type MedicalStore = {
  _id: string;
  name?: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panCardNumber?: string;
  gstType?: "IGST" | "CGST_SGST";
  isActive?: boolean;
};

type UserWithMedical = User & { medicalStore?: MedicalStore | null };

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

const getMedicalStoreId = (data: any) =>
  isObjectId(clean(data?.medicalStoreId))
    ? clean(data.medicalStoreId)
    : isObjectId(clean(data?.medicineId))
    ? clean(data.medicineId)
    : undefined;

const toMedicalStore = (value: unknown): MedicalStore | undefined => {
  if (!value) return undefined;

  if (typeof value === "string") {
    return isObjectId(value) ? { _id: value } : undefined;
  }

  if (typeof value === "object") {
    const source = value as Record<string, unknown>;
    const id = clean(source._id);
    if (!id || !isObjectId(id)) return undefined;

    return {
      _id: id,
      name: clean(source.name),
      phone: clean(source.phone),
      address: clean(source.address),
      state: clean(source.state),
      city: clean(source.city),
      pincode: clean(source.pincode),
      gstNumber: clean(source.gstNumber),
      panCardNumber: clean(source.panCardNumber),
      gstType:
        source.gstType === "IGST" || source.gstType === "CGST_SGST"
          ? source.gstType
          : source.taxType === "INTER"
          ? "IGST"
          : source.taxType === "INTRA"
          ? "CGST_SGST"
          : undefined,
      isActive: typeof source.isActive === "boolean" ? source.isActive : undefined,
    };
  }

  return undefined;
};

export const normalizeUser = (u: any): UserWithMedical => {
  const medicalStore = toMedicalStore(u?.medicalStoreId) || toMedicalStore(u?.medicalStore);
  const medicalStoreId = medicalStore?._id || getMedicalStoreId(u);

  return {
    ...u,
    _id: clean(u?._id) || "",
    name: clean(u?.name) || "",
    email: clean(u?.email) || "",
    role: clean(u?.role) || "USER",
    medicalStoreId: medicalStoreId || undefined,
    medicineId: medicalStoreId || "",
    medicalStore: medicalStore || null,
    medicalName: clean(u?.medicalName) || medicalStore?.name || "",
    phone: clean(u?.phone) || medicalStore?.phone || "",
    address: clean(u?.address) || medicalStore?.address || "",
    state: clean(u?.state) || medicalStore?.state || "",
    city: clean(u?.city) || medicalStore?.city || "",
    pincode: clean(u?.pincode) || medicalStore?.pincode || "",
    gstNumber: clean(u?.gstNumber) || medicalStore?.gstNumber || "",
    panCardNumber: clean(u?.panCardNumber) || medicalStore?.panCardNumber || "",
    signature: clean(u?.signature) || "",
  };
};

export const getAllUsersApi = async (params: {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}) => {
  const res = await dataOf(api.get(USERS_API.ROOT, { params }));
  return {
    ...res,
    users: Array.isArray(res?.users)
      ? res.users.map(normalizeUser)
      : [],
  };
};

export const createUserApi = async (data: CreateUserPayload) => {
  const medicalStoreId = getMedicalStoreId(data);
  if (!medicalStoreId && data.role?.toUpperCase() !== "ADMIN")
    throw new Error("Medical Store ID required.");

  const payload = {
    name: clean(data.name) || "",
    email: clean(data.email)?.toLowerCase() || "",
    password: clean(data.password) || "",
    medicalStoreId,
    role: clean(data.role),
    isActive: data.isActive,
    signature: clean(data.signature),
  };

  const res = await dataOf(api.post(USERS_API.ROOT, payload));
  return res?.user ? { ...res, user: normalizeUser(res.user) } : res;
};

export const updateUserApi = async (id: string, data: UpdateUserPayload) => {
  const medicalStoreId = getMedicalStoreId(data);

  const payload = {
    ...(clean(data.name) && { name: clean(data.name) }),
    ...(clean(data.email) && { email: clean(data.email)?.toLowerCase() }),
    ...(clean(data.signature) !== undefined && {
      signature: clean(data.signature) || "",
    }),
    ...(clean(data.role) && { role: clean(data.role) }),
    ...(typeof data.isActive === "boolean" && { isActive: data.isActive }),
    ...(medicalStoreId && { medicalStoreId }),
  };

  const res = await dataOf(api.put(USERS_API.BY_ID(id), payload));
  return res?.user ? { ...res, user: normalizeUser(res.user) } : res;
};

export const deleteUserApi = (id: string) =>
  dataOf(api.delete(USERS_API.BY_ID(id)));

export const getProfileApi = async () => {
  const res = await dataOf<any>(api.get(USERS_API.ME));
  const rawUser = res?.user ?? res;
  let normalized = normalizeUser(rawUser);

  const medicalStoreId =
    typeof normalized.medicalStoreId === "string"
      ? normalized.medicalStoreId
      : normalized.medicalStoreId?._id;

  if (!normalized.medicalStore && medicalStoreId && isObjectId(medicalStoreId)) {
    try {
      const storeResponse = await dataOf<any>(api.get(MEDICAL_STORES_API.BY_ID(medicalStoreId)));
      const medicalStore = toMedicalStore(storeResponse?.medicalStore ?? storeResponse);
      if (medicalStore) {
        normalized = normalizeUser({
          ...rawUser,
          medicalStoreId: medicalStore,
        });
      }
    } catch {
      // Keep user data even if medical store lookup fails.
    }
  }

  return normalized;
};

export const updateProfileApi = async (data: {
  name: string;
  email: string;
  signature?: string;
}) => {
  const payload = {
    name: clean(data.name) || "",
    email: clean(data.email)?.toLowerCase() || "",
    ...(data.signature !== undefined ? { signature: clean(data.signature) || "" } : {}),
  };

  const res = await dataOf(api.put(USERS_API.ME, payload));
  return normalizeUser(res.user);
};

export const changePasswordApi = (data: {
  oldPassword: string;
  newPassword: string;
}) => dataOf(api.put(USERS_API.ME_PASSWORD, data));
