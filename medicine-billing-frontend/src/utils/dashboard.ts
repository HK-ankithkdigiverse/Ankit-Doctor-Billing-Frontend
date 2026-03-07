import { toEntityId } from "./id";
import { getUserMedicalStoreId } from "./medicalStore";

type DashboardRow = Record<string, any>;

const getBillMedicalStoreIdForDashboard = (bill: DashboardRow | undefined | null) => {
  const directStoreId = toEntityId(bill?.medicalStoreId);
  if (directStoreId) return directStoreId;

  const creatorStoreId =
    toEntityId(bill?.userId?.medicalStoreId) ||
    toEntityId(bill?.createdBy?.medicalStoreId);

  if (creatorStoreId) return creatorStoreId;

  const companyStoreId = toEntityId(bill?.companyId?.medicalStoreId);
  if (companyStoreId) return companyStoreId;

  return "";
};

export const buildUserMedicalStoreIdByUserId = (
  users: DashboardRow[],
  currentUserId: string,
  currentUserMedicalStoreId: string
) => {
  const map = new Map<string, string>(
    users
      .map((u) => [toEntityId(u?._id), getUserMedicalStoreId(u)] as const)
      .filter(([userId, storeId]) => !!userId && !!storeId)
  );

  if (currentUserId && currentUserMedicalStoreId && !map.has(currentUserId)) {
    map.set(currentUserId, currentUserMedicalStoreId);
  }

  return map;
};

export const createStoreIdResolver = ({
  userMedicalStoreIdByUserId,
  currentUserId,
  currentUserMedicalStoreId,
}: {
  userMedicalStoreIdByUserId: Map<string, string>;
  currentUserId: string;
  currentUserMedicalStoreId: string;
}) => {
  return (userId: string) => {
    if (!userId) return "";

    const mappedStoreId = userMedicalStoreIdByUserId.get(userId);
    if (mappedStoreId) return mappedStoreId;

    if (userId === currentUserId) return currentUserMedicalStoreId || "";

    return "";
  };
};

export const getCompanyMedicalStoreIdForDashboard = (
  company: DashboardRow,
  resolveStoreIdByUserId: (userId: string) => string
) => {
  const directStoreId = toEntityId(company?.medicalStoreId);
  if (directStoreId) return directStoreId;

  if (typeof company?.userId === "object") {
    const ownerStoreId = toEntityId(company.userId?.medicalStoreId);
    if (ownerStoreId) return ownerStoreId;
  }

  const ownerId = toEntityId(company?.userId);
  return ownerId ? resolveStoreIdByUserId(ownerId) : "";
};

export const buildCompanyMedicalStoreIdByCompanyId = (
  companies: DashboardRow[],
  resolveStoreIdByUserId: (userId: string) => string
) =>
  new Map<string, string>(
    companies
      .map(
        (company) =>
          [
            toEntityId(company?._id),
            getCompanyMedicalStoreIdForDashboard(company, resolveStoreIdByUserId),
          ] as const
      )
      .filter(([companyId, storeId]) => !!companyId && !!storeId)
  );

export const getProductMedicalStoreIdForDashboard = (
  product: DashboardRow,
  resolveStoreIdByUserId: (userId: string) => string,
  companyMedicalStoreIdByCompanyId: Map<string, string>
) => {
  const directStoreId = toEntityId(product?.medicalStoreId);
  if (directStoreId) return directStoreId;

  const nestedStoreId = toEntityId(product?.medicalStore);
  if (nestedStoreId) return nestedStoreId;

  const creatorStoreId = toEntityId(product?.createdBy?.medicalStoreId);
  if (creatorStoreId) return creatorStoreId;

  const creatorId = toEntityId(product?.createdBy) || toEntityId(product?.userId);
  if (creatorId) return resolveStoreIdByUserId(creatorId);

  const companyStoreId = toEntityId(product?.companyId?.medicalStoreId);
  if (companyStoreId) return companyStoreId;

  const companyRefId = toEntityId(product?.companyId);
  return companyRefId
    ? companyMedicalStoreIdByCompanyId.get(companyRefId) || ""
    : "";
};

export const getCategoryMedicalStoreIdForDashboard = (
  category: DashboardRow,
  resolveStoreIdByUserId: (userId: string) => string
) => {
  const directStoreId = toEntityId(category?.medicalStoreId);
  if (directStoreId) return directStoreId;

  const creatorStoreId = toEntityId(category?.createdBy?.medicalStoreId);
  if (creatorStoreId) return creatorStoreId;

  const creatorId = toEntityId(category?.createdBy);
  return creatorId ? resolveStoreIdByUserId(creatorId) : "";
};

export const getBillResolvedMedicalStoreIdForDashboard = (
  bill: DashboardRow,
  resolveStoreIdByUserId: (userId: string) => string
) => {
  const directStoreId = getBillMedicalStoreIdForDashboard(bill);
  if (directStoreId) return directStoreId;

  const creatorId = toEntityId(bill?.userId) || toEntityId(bill?.createdBy);
  return creatorId ? resolveStoreIdByUserId(creatorId) : "";
};

export const filterByMedicalStore = <TRow>(
  rows: TRow[],
  medicalStoreId: string,
  resolveMedicalStoreId: (row: TRow) => string
) => {
  if (!medicalStoreId) return rows;
  return rows.filter((row) => resolveMedicalStoreId(row) === medicalStoreId);
};

export const enrichMedicalStoreNameByIdFromUsers = (
  medicalStoreNameById: Map<string, string>,
  users: DashboardRow[]
) => {
  users.forEach((targetUser: DashboardRow) => {
    const storeId = getUserMedicalStoreId(targetUser);
    if (!storeId || medicalStoreNameById.has(storeId)) return;

    const fallbackStoreName =
      (typeof targetUser?.medicalStoreId === "object"
        ? targetUser?.medicalStoreId?.name
        : "") ||
      targetUser?.medicalStore?.name ||
      targetUser?.medicalName ||
      "";

    if (fallbackStoreName) {
      medicalStoreNameById.set(storeId, String(fallbackStoreName).trim());
    }
  });

  return medicalStoreNameById;
};

export const toMedicalStoreOptionsFromNameMap = (
  medicalStoreNameById: Map<string, string>
) =>
  [...medicalStoreNameById.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const resolveCurrentUserMedicalStoreName = ({
  user,
  currentUserMedicalStoreId,
  medicalStoreNameById,
}: {
  user: DashboardRow;
  currentUserMedicalStoreId: string;
  medicalStoreNameById: Map<string, string>;
}) =>
  (currentUserMedicalStoreId
    ? medicalStoreNameById.get(currentUserMedicalStoreId)
    : "") ||
  (typeof user?.medicalStoreId === "object" ? user?.medicalStoreId?.name : "") ||
  user?.medicalStore?.name ||
  user?.medicalName ||
  currentUserMedicalStoreId ||
  "N/A";
