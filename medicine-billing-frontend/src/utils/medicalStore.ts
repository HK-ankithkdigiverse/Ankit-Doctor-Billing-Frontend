import { toEntityId } from "./id";

type MedicalStoreLike = {
  _id?: string;
  name?: string;
};

export const getUserMedicalStoreId = (user: {
  medicalStoreId?: unknown;
  medicineId?: unknown;
}): string => {
  const directStoreId = toEntityId(user?.medicalStoreId);
  if (directStoreId) return directStoreId;
  return typeof user?.medicineId === "string" ? user.medicineId : toEntityId(user?.medicineId);
};

export const buildMedicalStoreNameById = (
  stores: MedicalStoreLike[] | undefined,
  options?: { fallbackToId?: boolean }
) => {
  const map = new Map<string, string>();
  (stores ?? []).forEach((store) => {
    const storeId = store?._id ? String(store._id).trim() : "";
    if (!storeId) return;

    const storeName = store?.name ? String(store.name).trim() : "";
    const resolvedName = storeName || (options?.fallbackToId ? storeId : "");
    if (!resolvedName) return;

    map.set(storeId, resolvedName);
  });
  return map;
};
