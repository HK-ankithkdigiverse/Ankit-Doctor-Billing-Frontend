import type { MedicalStore, User } from "../../types";
import { clean, isObjectId } from "../../utils/common";
import { resolveBillTaxMode, resolveStoreGstPercent } from "../../utils/tax";

export type UserWithMedical = User & { medicalStore?: MedicalStore | null };

export const extractMedicalStoreId = (data: any) => {
  const id = clean(data?.medicalStoreId) || clean(data?.medicineId);
  return isObjectId(id) ? id : undefined;
};

export const toMedicalStore = (value: any): MedicalStore | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return isObjectId(value) ? { _id: value } : undefined;
  if (typeof value !== "object") return undefined;

  const id = clean(value._id);
  if (!isObjectId(id)) return undefined;

  return {
    _id: id,
    name: clean(value.name),
    phone: clean(value.phone),
    address: clean(value.address),
    state: clean(value.state),
    city: clean(value.city),
    pincode: clean(value.pincode),
    gstNumber: clean(value.gstNumber),
    panCardNumber: clean(value.panCardNumber),
    gstType: resolveBillTaxMode(value),
    gstPercent: resolveStoreGstPercent(value),
    taxType: value.taxType === "INTER" ? "INTER" : value.taxType === "INTRA" ? "INTRA" : undefined,
    isActive: typeof value.isActive === "boolean" ? value.isActive : undefined,
  };
};

export const normalizeUser = (user: any): UserWithMedical => {
  const medicalStore = toMedicalStore(user?.medicalStoreId) || toMedicalStore(user?.medicalStore);
  const medicalStoreId = medicalStore?._id || extractMedicalStoreId(user);
  const phoneNumber = clean(user?.phoneNumber) || clean(user?.phone) || medicalStore?.phone || "";

  return {
    ...user,
    _id: clean(user?._id) || "",
    name: clean(user?.name) || "",
    email: clean(user?.email) || "",
    role: clean(user?.role) || "USER",
    medicalStoreId,
    medicineId: medicalStoreId || "",
    medicalStore: medicalStore || null,
    medicalName: clean(user?.medicalName) || medicalStore?.name || "",
    phoneNumber,
    phone: phoneNumber,
    address: clean(user?.address) || medicalStore?.address || "",
    state: clean(user?.state) || medicalStore?.state || "",
    city: clean(user?.city) || medicalStore?.city || "",
    pincode: clean(user?.pincode) || medicalStore?.pincode || "",
    gstNumber: clean(user?.gstNumber) || medicalStore?.gstNumber || "",
    panCardNumber: clean(user?.panCardNumber) || medicalStore?.panCardNumber || "",
    signature: clean(user?.signature) || "",
  };
};
