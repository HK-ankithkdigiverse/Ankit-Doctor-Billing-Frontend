export type DateFilterType = "all" | "day" | "today" | "week" | "month" | "year" | "custom";
export type BillSortType = "newest" | "oldest";
export type BillTaxMode = "IGST" | "CGST_SGST";

export interface BillMedicalStore {
  _id?: string;
  name?: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panCardNumber?: string;
  gstType?: BillTaxMode;
  taxType?: "INTER" | "INTRA";
  gstPercent?: number;
}

export interface BillItem {
  _id?: string;
  srNo?: number;
  productId?: string | { _id?: string };
  productName?: string;
  category?: string;
  hsn?: string;
  batch?: string;
  exp?: string;
  qty: number;
  freeQty?: number;
  mrp?: number;
  rate: number;
  taxPercent?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  discount?: number;
  payment?: string;
  status?: string;
  total?: number;
}

export interface BillCompany {
  _id?: string;
  userId?: string | { _id?: string };
  medicalStoreId?: string | BillMedicalStore;
  companyName?: string;
  name?: string;
  gstNumber?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  state?: string;
}

export interface BillUser {
  _id?: string;
  name?: string;
  medicalName?: string;
  medicalStoreId?: string | BillMedicalStore;
  email?: string;
  signature?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  panCardNumber?: string;
  role?: string;
}

export interface Bill {
  _id?: string;
  billNo: string;
  companyId?: BillCompany;
  userId?: BillUser;
  createdBy?: BillUser;
  medicalStoreId?: string | BillMedicalStore;
  createdAt?: string;
  updatedAt?: string;
  subTotal?: number;
  totalTax?: number;
  discount?: number;
  discountPercent?: number;
  grandTotal?: number;
  gstType?: BillTaxMode;
  taxType?: "INTER" | "INTRA";
  gstPercent?: number;
  cgstTotal?: number;
  sgstTotal?: number;
  igstTotal?: number;
  totals?: BillTotals;
}

export interface BillTotals {
  subtotal?: number;
  discountPercent?: number;
  discountAmount?: number;
  taxableAmount?: number;
  gstType?: BillTaxMode;
  taxType?: "INTER" | "INTRA";
  gstPercent?: number;
  igst?: number;
  cgst?: number;
  sgst?: number;
  finalPayableAmount?: number;
}

export interface BillResponse {
  bill: Bill;
  items: BillItem[];
  totals?: BillTotals;
}

export interface BillFormItem {
  productId: string;
  qty: number;
  freeQty: number;
  rate: number;
  mrp: number;
  taxPercent?: number;
  discount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
}

export interface BillPayloadItem {
  productId: string;
  qty: number;
  freeQty?: number;
}

export interface BillFormRow extends BillFormItem {
  rowId: string;
}

export interface BillUserOption {
  value: string;
  label: string;
  medicalStoreId?: string;
  medicalStoreName?: string;
  medicalStoreState?: string;
}

export interface BillPayload {
  userId?: string;
  companyId: string;
  discount?: number;
  gstPercent?: number;
  items: BillPayloadItem[];
}

export interface BillUpdatePayload {
  discount?: number;
  gstPercent?: number;
  userId?: string;
  companyId?: string;
  items?: BillPayloadItem[];
}
