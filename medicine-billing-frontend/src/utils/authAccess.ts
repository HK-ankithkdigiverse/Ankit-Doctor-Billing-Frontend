import { ROLE } from "../constants";
import type { User } from "../types";

export type LoginBlockReason = "account-inactive" | "store-inactive";

const getRole = (user?: User | null) => String(user?.role || "").toUpperCase();

const getUserMedicalStore = (user?: User | null) => {
  if (!user) return null;
  if (user.medicalStore && typeof user.medicalStore === "object") return user.medicalStore;
  if (user.medicalStoreId && typeof user.medicalStoreId === "object") return user.medicalStoreId;
  return null;
};

export const isUserInactive = (user?: User | null) => user?.isActive === false;

export const isUserMedicalStoreInactive = (user?: User | null) => {
  if (!user || getRole(user) === ROLE.ADMIN) return false;
  return getUserMedicalStore(user)?.isActive === false;
};

export const getLoginBlockReason = (user?: User | null): LoginBlockReason | null => {
  if (isUserInactive(user)) return "account-inactive";
  if (isUserMedicalStoreInactive(user)) return "store-inactive";
  return null;
};
