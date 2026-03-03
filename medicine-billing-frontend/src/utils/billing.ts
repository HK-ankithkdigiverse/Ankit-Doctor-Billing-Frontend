import dayjs, { type Dayjs } from "dayjs";
import type {
  Bill,
  BillFormItem,
  BillFormRow,
  BillItem,
  BillPayloadItem,
  BillSortType,
  BillTaxMode,
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
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  grandTotal: number;
};

export type BillFormInitialValues = {
  initialUserId: string;
  initialCompanyId: string;
  initialCompanyName: string;
  initialDiscount: number;
  initialGstPercent: number;
  initialItems: BillFormItem[];
};

export const DATE_FILTER_OPTIONS: { value: DateFilterType; label: string }[] = [
  { value: "all", label: "All Dates" },
  { value: "day", label: "Day" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
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

const clampPercent = (value: unknown) => Math.min(Math.max(0, toNumber(value)), 100);

const getBillTotalTax = (bill: BillLike) => {
  const totals = (bill as Record<string, any> | undefined)?.totals;
  const splitTax = toNumber(totals?.igst) + toNumber(totals?.cgst) + toNumber(totals?.sgst);
  const hasSplitTaxTotals =
    totals?.igst !== undefined || totals?.cgst !== undefined || totals?.sgst !== undefined;
  return hasSplitTaxTotals ? splitTax : toNumber(totals?.totalTax ?? bill?.totalTax);
};

const toId = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in (value as Record<string, unknown>)) {
    return String((value as { _id?: unknown })._id || "");
  }
  return "";
};

const toMedicalStore = (value: unknown) => {
  if (!value || typeof value !== "object") return null;
  const store = value as Record<string, unknown>;
  return {
    _id: toId(store._id),
    name: typeof store.name === "string" ? store.name : "",
    phone: typeof store.phone === "string" ? store.phone : "",
    address: typeof store.address === "string" ? store.address : "",
    state: typeof store.state === "string" ? store.state : "",
    city: typeof store.city === "string" ? store.city : "",
    pincode: typeof store.pincode === "string" ? store.pincode : "",
    gstNumber: typeof store.gstNumber === "string" ? store.gstNumber : "",
    panCardNumber: typeof store.panCardNumber === "string" ? store.panCardNumber : "",
  };
};

export const formatBillCurrency = (value: unknown, options?: { withPrefix?: boolean }) => {
  const withPrefix = options?.withPrefix ?? true;
  const amount = toNumber(value).toFixed(2);
  return withPrefix ? `Rs ${amount}` : amount;
};

export const formatBillPercent = (value: unknown, digits = 2) => `${toNumber(value).toFixed(digits)}%`;

export const getBillCompanyId = (bill: BillLike) => toId(bill?.companyId);

export const getBillAssignedUserId = (bill: BillLike) => toId(bill?.userId || getBillCreator(bill));

export const resolveBillDiscountPercent = (bill: BillLike) => {
  const totals = (bill as Record<string, any> | undefined)?.totals;
  const subTotal = toNumber(totals?.subtotal ?? bill?.subTotal);
  const totalTax = getBillTotalTax(bill);
  const totalBeforeDiscount = subTotal + totalTax;

  const totalsPercent = toNumber(totals?.discountPercent, -1);
  if (totalsPercent >= 0) return clampPercent(totalsPercent);

  const explicitPercent = toNumber((bill as Record<string, any> | undefined)?.discountPercent, -1);
  if (explicitPercent >= 0) return clampPercent(explicitPercent);

  const totalsAmount = toNumber(totals?.discountAmount, -1);
  if (totalsAmount >= 0 && totalBeforeDiscount > 0) {
    return clampPercent((totalsAmount * 100) / totalBeforeDiscount);
  }

  const rawDiscount = toNumber((bill as Record<string, any> | undefined)?.discount, 0);
  if (rawDiscount > 100 && totalBeforeDiscount > 0) {
    return clampPercent((rawDiscount * 100) / totalBeforeDiscount);
  }

  return clampPercent(rawDiscount);
};

export const resolveBillDiscountAmount = (bill: BillLike) => {
  const totals = (bill as Record<string, any> | undefined)?.totals;
  const subTotal = toNumber(totals?.subtotal ?? bill?.subTotal);
  const totalTax = getBillTotalTax(bill);
  const totalBeforeDiscount = subTotal + totalTax;

  const totalsPercent = toNumber(totals?.discountPercent, -1);
  if (totalsPercent >= 0) {
    return (totalBeforeDiscount * clampPercent(totalsPercent)) / 100;
  }

  const explicitPercent = toNumber((bill as Record<string, any> | undefined)?.discountPercent, -1);
  if (explicitPercent >= 0) {
    return (totalBeforeDiscount * clampPercent(explicitPercent)) / 100;
  }

  const totalsAmount = toNumber(totals?.discountAmount, -1);
  if (totalsAmount >= 0) return Math.max(0, totalsAmount);

  const rawDiscount = toNumber((bill as Record<string, any> | undefined)?.discount, 0);
  if (rawDiscount > 100) return Math.max(0, rawDiscount);

  return (totalBeforeDiscount * clampPercent(rawDiscount)) / 100;
};

export const getBillAmountSummary = (bill: BillLike): BillAmountSummary => {
  const totals = (bill as Record<string, any> | undefined)?.totals;
  const subTotal = toNumber(totals?.subtotal ?? bill?.subTotal);
  const totalTax = getBillTotalTax(bill);
  const totalBeforeDiscount = subTotal + totalTax;
  const discountPercent = resolveBillDiscountPercent(bill);
  const discountAmount = resolveBillDiscountAmount(bill);
  const taxableAmount = Math.max(0, totalBeforeDiscount - discountAmount);
  const computedGrandTotal = toNumber(totals?.finalPayableAmount, taxableAmount);
  const grandTotal =
    bill?.grandTotal === undefined || bill?.grandTotal === null
      ? Math.max(0, computedGrandTotal)
      : Math.max(0, toNumber(bill.grandTotal));

  return {
    subTotal,
    totalTax,
    totalBeforeDiscount,
    discountPercent,
    discountAmount,
    taxableAmount,
    grandTotal,
  };
};

export const getBillGrandTotal = (bill: BillLike) => getBillAmountSummary(bill).grandTotal;

export const resolveBillGstPercent = (bill: BillLike, items: BillItem[] = []) => {
  const totals = (bill as Record<string, any> | undefined)?.totals;
  const totalsGstPercent = toNumber(totals?.gstPercent, -1);
  if (totalsGstPercent >= 0) return totalsGstPercent;

  const explicitBillGst = toNumber((bill as Record<string, any> | undefined)?.gstPercent, -1);
  if (explicitBillGst >= 0) return explicitBillGst;

  const billSubTotal = toNumber(totals?.subtotal ?? (bill as Record<string, any> | undefined)?.subTotal);
  const billTax = getBillTotalTax(bill);
  if (billSubTotal > 0) {
    return (billTax * 100) / billSubTotal;
  }

  const firstItemTaxPercent = toNumber(items[0]?.taxPercent, -1);
  return firstItemTaxPercent >= 0 ? firstItemTaxPercent : 0;
};

export const getBillItemTaxAmount = (item: BillItem | Record<string, any> | undefined | null) => {
  const cgst = toNumber(item?.cgst);
  const sgst = toNumber(item?.sgst);
  const igst = toNumber((item as Record<string, any> | undefined)?.igst);
  if (cgst || sgst || igst) return cgst + sgst + igst;

  const amount = toNumber(item?.rate) * toNumber(item?.qty);
  return (amount * toNumber(item?.taxPercent)) / 100;
};

export const getBillItemTotalAmount = (item: BillItem | Record<string, any> | undefined | null) => {
  if (item?.total !== undefined && item?.total !== null) {
    return toNumber(item.total);
  }

  const amount = toNumber(item?.rate) * toNumber(item?.qty);
  return amount + getBillItemTaxAmount(item);
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

export const getBillMedicalStoreId = (bill: Bill | Record<string, any> | undefined | null) => {
  const directStoreId = toId((bill as Record<string, any> | undefined)?.medicalStoreId);
  if (directStoreId) return directStoreId;

  const creatorStoreId = toId(getBillCreator(bill)?.medicalStoreId);
  if (creatorStoreId) return creatorStoreId;

  const companyStoreId = toId((bill as Record<string, any> | undefined)?.companyId?.medicalStoreId);
  if (companyStoreId) return companyStoreId;

  return "";
};

export const getBillMedicalStoreName = (bill: Bill | Record<string, any> | undefined | null) => {
  const directStore = toMedicalStore((bill as Record<string, any> | undefined)?.medicalStoreId);
  if (directStore?.name?.trim()) return directStore.name.trim();

  const creatorStore = toMedicalStore(getBillCreator(bill)?.medicalStoreId);
  if (creatorStore?.name?.trim()) return creatorStore.name.trim();

  const companyStore = toMedicalStore((bill as Record<string, any> | undefined)?.companyId?.medicalStoreId);
  if (companyStore?.name?.trim()) return companyStore.name.trim();

  return "-";
};

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
  const creatorStore = toMedicalStore(creator?.medicalStoreId);
  const billStore = toMedicalStore((bill as Record<string, unknown> | undefined)?.medicalStoreId);
  const medicalStore = creatorStore?._id ? creatorStore : billStore;

  return {
    name: creator?.name || "-",
    medicalName: creator?.medicalName || medicalStore?.name || "",
    email: creator?.email || "-",
    phone: creator?.phone || medicalStore?.phone || "-",
    address: creator?.address || medicalStore?.address || "-",
    signature: creator?.signature || "",
    gstNumber: creator?.gstNumber || medicalStore?.gstNumber || "-",
    panCardNumber: creator?.panCardNumber || medicalStore?.panCardNumber || "-",
  };
};

export const getBillDateValue = (
  bill: Bill | Record<string, any> | undefined | null,
  field: "created" | "updated" = "created"
) => {
  const candidates =
    field === "created"
      ? [
          bill?.createdAt,
          (bill as Record<string, any> | undefined)?.createdDate,
          (bill as Record<string, any> | undefined)?.date,
          (bill as Record<string, any> | undefined)?.billDate,
          (bill as Record<string, any> | undefined)?.bill?.createdAt,
          (bill as Record<string, any> | undefined)?.bill?.date,
        ]
      : [
          bill?.updatedAt,
          (bill as Record<string, any> | undefined)?.updatedDate,
          bill?.createdAt,
          (bill as Record<string, any> | undefined)?.createdDate,
          (bill as Record<string, any> | undefined)?.bill?.updatedAt,
          (bill as Record<string, any> | undefined)?.bill?.createdAt,
        ];

  return candidates.find((value) => value !== undefined && value !== null && String(value).trim() !== "");
};

export const getBillDate = (
  bill: Bill | Record<string, any> | undefined | null,
  field: "created" | "updated" = "created"
) => {
  const raw = getBillDateValue(bill, field);
  if (!raw) return null;
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed : null;
};

export const isBillInDateFilter = (
  bill: Bill | Record<string, any>,
  dateFilter: DateFilterType,
  customRange: BillingDateRange = null
) => {
  if (dateFilter === "all") return true;
  const createdAt = getBillDate(bill, "created");
  if (!createdAt) return false;

  if (dateFilter === "day" || dateFilter === "today") return createdAt.isSame(dayjs(), "day");

  if (dateFilter === "week") {
    const { start, end } = getCurrentWeekRange();
    return !createdAt.isBefore(start) && !createdAt.isAfter(end);
  }

  if (dateFilter === "month") {
    const start = dayjs().startOf("month");
    const end = dayjs().endOf("month");
    return !createdAt.isBefore(start) && !createdAt.isAfter(end);
  }

  if (dateFilter === "year") {
    const start = dayjs().startOf("year");
    const end = dayjs().endOf("year");
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
    medicalStoreId,
    dateFilter,
    customRange,
  }: {
    isAdmin: boolean;
    createdBy?: string;
    medicalStoreId?: string;
    dateFilter: DateFilterType;
    customRange?: BillingDateRange;
  }
) =>
  bills.filter((bill) => {
    const userOk = !isAdmin || !createdBy || getBillCreatorId(bill) === createdBy;
    const medicalStoreOk = !isAdmin || !medicalStoreId || getBillMedicalStoreId(bill) === medicalStoreId;
    const dateOk = isBillInDateFilter(bill, dateFilter, customRange ?? null);
    return userOk && medicalStoreOk && dateOk;
  });

export const sortBillsByCreatedAt = <T extends Bill | Record<string, any>>(bills: T[], sortOrder: BillSortType) =>
  [...bills].sort((a, b) => {
    const ta = getBillDate(a, "created")?.valueOf() ?? 0;
    const tb = getBillDate(b, "created")?.valueOf() ?? 0;
    return sortOrder === "newest" ? tb - ta : ta - tb;
  });

export const mapUsersToSelectOptions = (
  users:
    | Array<{
        _id?: string;
        name?: string;
        email?: string;
        state?: string;
        medicalStore?:
          | {
              _id?: string;
              name?: string;
              state?: string;
            }
          | null;
        medicalStoreId?:
          | string
          | {
              _id?: string;
              name?: string;
              state?: string;
            }
          | null;
      }>
    | undefined,
  includeEmailWithName = false
): BillUserOption[] =>
  (users ?? [])
    .filter((user) => user?._id)
    .map((user) => {
      const name = user.name || "";
      const email = user.email || "";
      const label = includeEmailWithName ? (name ? `${name} (${email})` : email) : name || email;
      const medicalStore =
        typeof user.medicalStoreId === "object"
          ? user.medicalStoreId
          : typeof user.medicalStore === "object"
          ? user.medicalStore
          : undefined;
      const medicalStoreId =
        typeof user.medicalStoreId === "string"
          ? user.medicalStoreId
          : user.medicalStoreId?._id;
      const medicalStoreName = medicalStore?.name || "";
      const medicalStoreState = (user.state || medicalStore?.state || "").trim();
      return {
        value: user._id as string,
        label,
        medicalStoreId,
        medicalStoreName,
        medicalStoreState,
      };
    });

export const EMPTY_BILL_ITEM: BillFormItem = {
  productId: "",
  qty: 1,
  freeQty: 0,
  rate: 0,
  mrp: 0,
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
  }));

export const getBillFormInitialValues = (billData?: {
  bill?: Bill | Record<string, any> | null;
  items?: BillItem[];
}): BillFormInitialValues => ({
  initialUserId: getBillAssignedUserId(billData?.bill),
  initialCompanyId: getBillCompanyId(billData?.bill),
  initialCompanyName: getBillCompanyName(billData?.bill),
  initialDiscount: resolveBillDiscountPercent(billData?.bill),
  initialGstPercent: resolveBillGstPercent(billData?.bill, billData?.items ?? []),
  initialItems: normalizeBillItemsForForm(billData?.items ?? []),
});

export const getBillRowTotals = (items: BillFormRow[]) =>
  getBillRowTotalsWithTaxMode(items, { taxMode: "CGST_SGST", gstPercent: 0 });

export type BillRowTotal = {
  baseAmount: number;
  discountAmount: number;
  taxable: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  taxPercent: number;
};

type BillTaxConfig = {
  taxMode: BillTaxMode;
  gstPercent: number;
};

export const getBillRowTotalsWithTaxMode = (
  items: BillFormRow[],
  config: BillTaxConfig
) => {
  return items.reduce<Record<string, BillRowTotal>>((acc, item) => {
    const baseAmount = toNumber(item.rate) * toNumber(item.qty);
    const effectiveTaxPercent = toNumber(config.gstPercent);

    acc[item.rowId] = {
      baseAmount,
      discountAmount: 0,
      taxable: baseAmount,
      tax: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: baseAmount,
      taxPercent: effectiveTaxPercent,
    };
    return acc;
  }, {});
};

export const getBillSummary = (
  items: BillFormRow[],
  discount: number,
  config: BillTaxConfig
) => {
  const rowTotals = getBillRowTotalsWithTaxMode(items, config);
  const rows = Object.values(rowTotals);
  const subTotal = rows.reduce((sum, row) => sum + row.baseAmount, 0);
  const totalTax = (subTotal * toNumber(config.gstPercent)) / 100;
  const totalIgst = config.taxMode === "IGST" ? totalTax : 0;
  const totalCgst = config.taxMode === "IGST" ? 0 : totalTax / 2;
  const totalSgst = config.taxMode === "IGST" ? 0 : totalTax / 2;
  const totalBeforeDiscount = subTotal + totalTax;
  const discountPercent = clampPercent(discount);
  const discountAmount = (totalBeforeDiscount * discountPercent) / 100;
  const taxableAmount = Math.max(0, totalBeforeDiscount - discountAmount);
  const grandTotal = taxableAmount;

  return {
    rowTotals,
    subTotal,
    totalTax,
    totalCgst,
    totalSgst,
    totalIgst,
    totalBeforeDiscount,
    discountPercent,
    discountAmount,
    taxableAmount,
    grandTotal,
  };
};

export const validateBillForm = ({
  isAdmin,
  userId,
  companyId,
  gstPercent,
  discount,
  items,
}: {
  isAdmin: boolean;
  userId: string;
  companyId: string;
  gstPercent: number;
  discount: number;
  items: BillFormRow[];
}) => {
  if (!companyId) return "Company is required";
  if (isAdmin && !userId) return "User is required";
  if (toNumber(gstPercent) < 0 || toNumber(gstPercent) > 100) return "GST % must be between 0 and 100";
  if (toNumber(discount) < 0 || toNumber(discount) > 100) return "Discount % must be between 0 and 100";
  if (!items.length) return "At least one bill item is required";

  const invalidItemIndex = items.findIndex((item) => {
    const qty = toNumber(item.qty);
    const rate = toNumber(item.rate);
    return !item.productId || qty <= 0 || rate <= 0;
  });

  if (invalidItemIndex >= 0) {
    return `Please fix item #${invalidItemIndex + 1} (product/qty/rate).`;
  }

  return "";
};

export const toBillPayloadItems = (items: BillFormRow[]): BillPayloadItem[] =>
  items.map(({ rowId: _rowId, ...item }) => ({
    productId: item.productId,
    qty: toNumber(item.qty),
    ...(toNumber(item.freeQty) > 0 ? { freeQty: toNumber(item.freeQty) } : {}),
  }));
