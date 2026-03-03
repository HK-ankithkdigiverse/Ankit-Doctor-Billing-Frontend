export interface Category {
  _id: string;
  name: string;
  description?: string;
  medicalStoreId?:
    | string
    | {
        _id?: string;
        name?: string;
      };
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    _id: string;
    name?: string;
    email?: string;
    role?: string;
  } | string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  userId?: string;
  medicalStoreId?: string;
}

export interface CategoryDropdownItem {
  _id: string;
  name: string;
}
