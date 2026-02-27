export interface User {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}

export interface Company {
  _id: string;
  companyName?: string;
  name?: string;
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

  companyId?: Company;
  createdBy?: User;
}
