import { toEntityId } from "./id";

type MedicalStoreLike = {
  _id?: string;
  name?: string;
  isActive?: boolean;
};

type MedicalStoreOption = {
  value: string;
  label: string;
};

export const getUserMedicalStoreId = (user: {
  medicalStoreId?: unknown;
  medicineId?: unknown;
}): string => {
  const directStoreId = toEntityId(user?.medicalStoreId);
  if (directStoreId) return directStoreId;
  return typeof user?.medicineId === "string" ? user.medicineId : toEntityId(user?.medicineId);
};

export const getCompanyMedicalStoreId = (
  company:
    | {
        medicalStoreId?: unknown;
        medicineId?: unknown;
        userId?: unknown;
      }
    | undefined
    | null
): string => {
  const directStoreId = toEntityId(company?.medicalStoreId);
  if (directStoreId) return directStoreId;

  const legacyStoreId = toEntityId(company?.medicineId);
  if (legacyStoreId) return legacyStoreId;

  if (company?.userId && typeof company.userId === "object") {
    return getUserMedicalStoreId(company.userId as { medicalStoreId?: unknown; medicineId?: unknown });
  }

  return "";
};

export const getCategoryMedicalStoreId = (category: { medicalStoreId?: unknown } | undefined | null): string =>
  toEntityId(category?.medicalStoreId);

export const getProductMedicalStoreId = (
  product:
    | {
        medicalStoreId?: unknown;
        medicineId?: unknown;
        medicalStore?: unknown;
        createdBy?: {
          medicalStoreId?: unknown;
          medicineId?: unknown;
        };
      }
    | undefined
    | null
): string => {
  const directStoreId = toEntityId(product?.medicalStoreId);
  if (directStoreId) return directStoreId;

  const legacyStoreId = toEntityId(product?.medicineId);
  if (legacyStoreId) return legacyStoreId;

  const nestedStoreId = toEntityId(product?.medicalStore);
  if (nestedStoreId) return nestedStoreId;

  return getUserMedicalStoreId(product?.createdBy || {});
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

export const buildMedicalStoreOptions = (
  stores: MedicalStoreLike[] | undefined,
  options?: {
    includeInactive?: boolean;
    fallbackToId?: boolean;
    includeIds?: string[];
    sort?: boolean;
  }
): MedicalStoreOption[] => {
  const optionMap = new Map<string, string>();

  (stores ?? []).forEach((store) => {
    const storeId = toEntityId(store?._id);
    if (!storeId) return;
    if (options?.includeInactive !== true && store?.isActive === false) return;

    const storeName = typeof store?.name === "string" ? store.name.trim() : "";
    const label = storeName || (options?.fallbackToId ? storeId : "");
    if (!label) return;
    optionMap.set(storeId, label);
  });

  (options?.includeIds ?? []).forEach((storeIdCandidate) => {
    const storeId = toEntityId(storeIdCandidate);
    if (!storeId || optionMap.has(storeId)) return;
    optionMap.set(storeId, storeId);
  });

  const selectOptions = [...optionMap.entries()].map(([value, label]) => ({ value, label }));
  if (options?.sort === false) return selectOptions;
  return selectOptions.sort((a, b) => a.label.localeCompare(b.label));
};
