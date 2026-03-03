export const ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const MEDICINE_ID_MODE = {
  CREATE_NEW: "CREATE_NEW",
  ASSIGN_EXISTING: "ASSIGN_EXISTING",
} as const;

export type MedicineIdMode =
  (typeof MEDICINE_ID_MODE)[keyof typeof MEDICINE_ID_MODE];
