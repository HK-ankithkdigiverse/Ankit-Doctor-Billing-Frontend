export interface Category {
  _id: string;
  name: string;
  description?: string;
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
}

export interface CategoryDropdownItem {
  _id: string;
  name: string;
}
