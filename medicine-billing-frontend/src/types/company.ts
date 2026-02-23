export type Company = {
  _id: string;
  userId:
    | string
    | {
        _id?: string;
        name?: string;
        email?: string;
        role?: string;
      };
  companyName: string;
  gstNumber: string;
  address?: string;
  phone?: string;
  email?: string;
  state?: string;
  logo?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
};
