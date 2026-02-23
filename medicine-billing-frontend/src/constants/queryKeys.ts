export const QUERY_KEYS = {
  ME: ["me"],
  PROFILE: ["profile"],

  PRODUCTS: ["products"],
  PRODUCTS_LIST: (params?: any) => ["products", params],
  PRODUCT: (id: string) => ["product", id],

  COMPANIES: ["companies"],
  COMPANIES_LIST: (params?: any) => ["companies", params],
  COMPANY: (id: string) => ["company", id],

  CATEGORIES: ["categories"],
  CATEGORIES_LIST: (params?: any) => ["categories", params],
  CATEGORY: (id: string) => ["category", id],
  CATEGORIES_DROPDOWN: ["categories", "dropdown"],

  BILLS: ["bills"],
  BILLS_LIST: (params?: any) => ["bills", params],
  BILL: (id: string) => ["bill", id],

  USERS: ["users"],
  USERS_LIST: (params?: any) => ["users", params],
};
