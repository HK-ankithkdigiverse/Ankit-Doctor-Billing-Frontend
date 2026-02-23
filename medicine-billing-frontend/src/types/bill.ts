/* =====================
   BILL TYPES
===================== */

export interface BillItem {
  _id: string;
  srNo?: number;
  productName: string;
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
  total: number;
}

export interface BillCompany {
  companyName: string;
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
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
}

export interface Bill {
  _id?: string;
  billNo: string;
  companyId?: BillCompany;
  userId?: BillUser;
  createdAt?: string;
  subTotal?: number;
  totalTax?: number;
  discount?: number;
  grandTotal: number;
}

export interface BillResponse {
  bill: Bill;
  items: BillItem[];
}
