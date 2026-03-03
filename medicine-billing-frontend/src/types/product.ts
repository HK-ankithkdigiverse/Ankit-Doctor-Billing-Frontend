export interface User {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  medicalStoreId?: string | { _id?: string };
}

export interface Company {
  _id: string;
  companyName?: string;
  name?: string;
  medicalStoreId?: string | { _id?: string; name?: string };
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  productType: string;
  price: number;
  stock: number;
  mrp: number;
  taxPercent?: number;
  createdAt?: string;
  updatedAt?: string;

  companyId?: Company;
  medicalStoreId?: string | { _id?: string; name?: string };
  createdBy?: User;
}
