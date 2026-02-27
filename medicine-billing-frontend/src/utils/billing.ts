import dayjs, { type Dayjs } from "dayjs";
import type {
  Bill,
  BillFormItem,
  BillFormRow,
  BillItem,
  BillSortType,
  BillUser,
  BillUserOption,
  DateFilterType,
} from "../types/bill";

export type BillingDateRange = [Dayjs | null, Dayjs | null] | null;
type BillLike = Bill | Record<string, any> | undefined | null;

export type BillAmountSummary = {
  subTotal: number;
  totalTax: number;
  totalBeforeDiscount: number;
  discountAmount: number;
  grandTotal: number;
};

export type BillFormInitialValues = {
  initialUserId: string;
  initialCompanyId: string;
  initialCompanyName: string;
  initialDiscount: number;
  initialItems: BillFormItem[];
};

export const DATE_FILTER_OPTIONS: { value: DateFilterType; label: string }[] = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

export const BILL_SORT_OPTIONS: { value: BillSortType; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toId = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in (value as Record<string, unknown>)) {
    return String((value as { _id?: unknown })._id || "");
  }
  return "";
};

export const formatBillCurrency = (value: unknown, options?: { withPrefix?: boolean }) => {
  const withPrefix = options?.withPrefix ?? true;
  const amount = toNumber(value).toFixed(2);
  return withPrefix ? `Rs ${amount}` : amount;
};

export const formatBillPercent = (value: unknown, digits = 2) => `${toNumber(value).toFixed(digits)}%`;

export const getBillCompanyId = (bill: BillLike) => toId(bill?.companyId);

export const getBillAssignedUserId = (bill: BillLike) => toId(bill?.userId || getBillCreator(bill));

export const getBillAmountSummary = (bill: BillLike): BillAmountSummary => {
  const subTotal = toNumber(bill?.subTotal);
  const totalTax = toNumber(bill?.totalTax);
  const totalBeforeDiscount = subTotal + totalTax;
  const discountAmount = Math.max(0, toNumber(bill?.discount));
  const computedGrandTotal = totalBeforeDiscount - discountAmount;
  const grandTotal =
    bill?.grandTotal === undefined || bill?.grandTotal === null
      ? Math.max(0, computedGrandTotal)
      : Math.max(0, toNumber(bill.grandTotal));

  return {
    subTotal,
    totalTax,
    totalBeforeDiscount,
    discountAmount,
    grandTotal,
  };
};

export const getBillGrandTotal = (bill: BillLike) => getBillAmountSummary(bill).grandTotal;

export const getBillItemTaxAmount = (item: BillItem | Record<string, any> | undefined | null) => {
  const cgst = toNumber(item?.cgst);
  const sgst = toNumber(item?.sgst);
  if (cgst || sgst) return cgst + sgst;

  const amount = toNumber(item?.rate) * toNumber(item?.qty);
  const discount = (amount * toNumber(item?.discount)) / 100;
  const taxable = amount - discount;
  return (taxable * toNumber(item?.taxPercent)) / 100;
};

export const getBillItemTotalAmount = (item: BillItem | Record<string, any> | undefined | null) => {
  if (item?.total !== undefined && item?.total !== null) {
    return toNumber(item.total);
  }

  const amount = toNumber(item?.rate) * toNumber(item?.qty);
  const discount = (amount * toNumber(item?.discount)) / 100;
  const taxable = amount - discount;
  return taxable + getBillItemTaxAmount(item);
};

export const getCurrentWeekRange = (baseDate = dayjs()) => {
  const mondayStart = baseDate.startOf("day").subtract((baseDate.day() + 6) % 7, "day");
  const sundayEnd = mondayStart.add(6, "day").endOf("day");
  return { start: mondayStart, end: sundayEnd };
};

export const getBillCreator = (bill: Bill | Record<string, any> | undefined | null): BillUser | undefined =>
  (bill?.userId as BillUser | undefined) || (bill?.createdBy as BillUser | undefined);

export const getBillCreatorId = (bill: Bill | Record<string, any> | undefined | null) =>
  getBillCreator(bill)?._id || "";

export const getBillCreatorLabel = (bill: Bill | Record<string, any> | undefined | null) => {
  const creator = getBillCreator(bill);
  const name = creator?.name || "";
  const email = creator?.email || "";
  if (!name) return "-";
  return email ? `${name} (${email})` : name;
};

export const getBillCompanyName = (bill: Bill | Record<string, any> | undefined | null) =>
  bill?.companyId?.companyName || bill?.companyId?.name || "-";

export const getBillUserProfile = (bill: Bill | Record<string, any> | undefined | null) => {
  const creator = getBillCreator(bill);
  return {
    name: creator?.name || "-",
    medicalName: creator?.medicalName || "",
    email: creator?.email || "-",
    phone: creator?.phone || "-",
    address: creator?.address || "-",
    signature: creator?.signature || "",
    gstNumber: creator?.gstNumber || "-",
    panCardNumber: creator?.panCardNumber || "-",
  };
};

export const isBillInDateFilter = (
  bill: Bill | Record<string, any>,
  dateFilter: DateFilterType,
  customRange: BillingDateRange = null
) => {
  if (dateFilter === "all") return true;
  const createdAt = bill?.createdAt ? dayjs(bill.createdAt) : null;
  if (!createdAt || !createdAt.isValid()) return false;

  if (dateFilter === "today") return createdAt.isSame(dayjs(), "day");

  if (dateFilter === "week") {
    const { start, end } = getCurrentWeekRange();
    return !createdAt.isBefore(start) && !createdAt.isAfter(end);
  }

  if (dateFilter === "month") {
    const start = dayjs().startOf("month");
    const end = dayjs().endOf("month");
    return !createdAt.isBefore(start) && !createdAt.isAfter(end);
  }

  if (dateFilter === "custom") {
    const start = customRange?.[0];
    const end = customRange?.[1];
    if (!start || !end) return true;
    return !createdAt.isBefore(start.startOf("day")) && !createdAt.isAfter(end.endOf("day"));
  }

  return true;
};

export const filterBills = <T extends Bill | Record<string, any>>(
  bills: T[],
  {
    isAdmin,
    createdBy,
    dateFilter,
    customRange,
  }: {
    isAdmin: boolean;
    createdBy?: string;
    dateFilter: DateFilterType;
    customRange?: BillingDateRange;
  }
) =>
  bills.filter((bill) => {
    const userOk = !isAdmin || !createdBy || getBillCreatorId(bill) === createdBy;
    const dateOk = isBillInDateFilter(bill, dateFilter, customRange ?? null);
    return userOk && dateOk;
  });

export const sortBillsByCreatedAt = <T extends Bill | Record<string, any>>(bills: T[], sortOrder: BillSortType) =>
  [...bills].sort((a, b) => {
    const ta = dayjs(a?.createdAt).isValid() ? dayjs(a.createdAt).valueOf() : 0;
    const tb = dayjs(b?.createdAt).isValid() ? dayjs(b.createdAt).valueOf() : 0;
    return sortOrder === "newest" ? tb - ta : ta - tb;
  });

export const mapUsersToSelectOptions = (
  users: Array<{ _id?: string; name?: string; email?: string }> | undefined,
  includeEmailWithName = false
): BillUserOption[] =>
  (users ?? [])
    .filter((user) => user?._id)
    .map((user) => {
      const name = user.name || "";
      const email = user.email || "";
      const label = includeEmailWithName ? (name ? `${name} (${email})` : email) : name || email;
      return { value: user._id as string, label };
    });

export const EMPTY_BILL_ITEM: BillFormItem = {
  productId: "",
  qty: 1,
  freeQty: 0,
  rate: 0,
  mrp: 0,
  taxPercent: 0,
  discount: 0,
};

export const createBillRowId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const toBillFormRow = (item?: Partial<BillFormItem>): BillFormRow => ({
  rowId: createBillRowId(),
  ...EMPTY_BILL_ITEM,
  ...item,
});

export const normalizeBillFormRows = (items?: BillFormItem[]) =>
  items && items.length ? items.map((item) => toBillFormRow(item)) : [toBillFormRow()];

export const normalizeBillItemsForForm = (items: BillItem[] = []): BillFormItem[] =>
  items.map((item) => ({
    productId:
      typeof item.productId === "object" ? item.productId?._id || "" : String(item.productId || ""),
    qty: toNumber(item.qty, 1),
    freeQty: toNumber(item.freeQty, 0),
    rate: toNumber(item.rate, 0),
    mrp: toNumber(item.mrp, 0),
    taxPercent: toNumber(item.taxPercent, 0),
    discount: toNumber(item.discount, 0),
  }));

export const getBillFormInitialValues = (billData?: {
  bill?: Bill | Record<string, any> | null;
  items?: BillItem[];
}): BillFormInitialValues => ({
  initialUserId: getBillAssignedUserId(billData?.bill),
  initialCompanyId: getBillCompanyId(billData?.bill),
  initialCompanyName: getBillCompanyName(billData?.bill),
  initialDiscount: toNumber(billData?.bill?.discount, 0),
  initialItems: normalizeBillItemsForForm(billData?.items ?? []),
});

export const getBillRowTotals = (items: BillFormRow[]) =>
  items.reduce<Record<string, { taxable: number; tax: number; total: number }>>((acc, item) => {
    const amount = toNumber(item.rate) * toNumber(item.qty);
    const discount = (amount * toNumber(item.discount)) / 100;
    const taxable = amount - discount;
    const tax = (taxable * toNumber(item.taxPercent)) / 100;
    acc[item.rowId] = { taxable, tax, total: taxable + tax };
    return acc;
  }, {});

export const getBillSummary = (items: BillFormRow[], discount: number) => {
  const rowTotals = getBillRowTotals(items);
  const rows = Object.values(rowTotals);
  const subTotal = rows.reduce((sum, row) => sum + row.taxable, 0);
  const totalTax = rows.reduce((sum, row) => sum + row.tax, 0);
  const totalBeforeDiscount = subTotal + totalTax;
  const discountAmount = Math.max(0, toNumber(discount));
  const grandTotal = Math.max(0, totalBeforeDiscount - discountAmount);

  return {
    rowTotals,
    subTotal,
    totalTax,
    totalBeforeDiscount,
    discountAmount,
    grandTotal,
  };
};

export const validateBillForm = ({
  isAdmin,
  userId,
  companyId,
  discount,
  totalBeforeDiscount,
  items,
}: {
  isAdmin: boolean;
  userId: string;
  companyId: string;
  discount: number;
  totalBeforeDiscount: number;
  items: BillFormRow[];
}) => {
  if (!companyId) return "Company is required";
  if (isAdmin && !userId) return "User is required";
  if (discount < 0) return "Bill discount cannot be negative";
  if (toNumber(discount) > totalBeforeDiscount) return "Discount amount cannot be greater than total bill amount.";
  if (!items.length) return "At least one bill item is required";

  const invalidItemIndex = items.findIndex((item) => {
    const qty = toNumber(item.qty);
    const rate = toNumber(item.rate);
    const tax = toNumber(item.taxPercent);
    const lineDiscount = toNumber(item.discount);
    return !item.productId || qty <= 0 || rate <= 0 || tax < 0 || tax > 100 || lineDiscount < 0 || lineDiscount > 100;
  });

  if (invalidItemIndex >= 0) {
    return `Please fix item #${invalidItemIndex + 1} (product/qty/rate/gst/discount).`;
  }

  return "";
};

export const toBillPayloadItems = (items: BillFormRow[]): BillFormItem[] =>
  items.map(({ rowId: _rowId, ...item }) => ({
    productId: item.productId,
    qty: toNumber(item.qty),
    freeQty: toNumber(item.freeQty),
    rate: toNumber(item.rate),
    mrp: toNumber(item.mrp),
    taxPercent: toNumber(item.taxPercent),
    discount: toNumber(item.discount),
  }));
