export type DateFilterType = "all" | "today" | "week" | "month" | "custom";
export type BillSortType = "newest" | "oldest";

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
  discount?: number;
  payment?: string;
  status?: string;
  total?: number;
}

export interface BillCompany {
  _id?: string;
  userId?: string | { _id?: string };
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
  email?: string;
  signature?: string;
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
  createdAt?: string;
  updatedAt?: string;
  subTotal?: number;
  totalTax?: number;
  discount?: number;
  grandTotal?: number;
}

export interface BillResponse {
  bill: Bill;
  items: BillItem[];
}

export interface BillFormItem {
  productId: string;
  qty: number;
  freeQty: number;
  rate: number;
  mrp: number;
  taxPercent: number;
  discount: number;
}

export interface BillFormRow extends BillFormItem {
  rowId: string;
}

export interface BillUserOption {
  value: string;
  label: string;
}

export interface BillPayload {
  userId?: string;
  companyId: string;
  discount: number;
  items: BillFormItem[];
}

export interface BillUpdatePayload {
  discount: number;
  userId?: string;
  companyId?: string;
  items?: BillFormItem[];
}
