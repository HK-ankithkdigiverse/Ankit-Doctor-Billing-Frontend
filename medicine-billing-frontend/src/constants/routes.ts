export const ROUTES = {
  LOGIN: "/",
  SIGNUP: "/signup",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  PRODUCTS: "/products",
  CREATE_PRODUCT: "/products/create",
  PRODUCT_DETAILS: (id: string) => `/products/${id}`,
  PRODUCT_EDIT: "/products/:id/edit",

  DASHBOARD: "/dashboard",
  COMPANIES: "/companies",
  CREATE_COMPANY: "/companies/create",
  COMPANY_DETAILS: (id: string) => `/companies/${id}`,
  COMPANY_EDIT: "/companies/:id/edit",
  CATEGORIES: "/categories",
  CREATE_CATEGORY: "/categories/create",
  CATEGORY_EDIT: "/categories/:id/edit",

  PROFILE: "/profile",
  EDITPROFILE: "/profile/edit",
  CHANGE_PASSWORD: "/profile/change-password",

  BILLING: "/billing",                
  CREATE_BILL: "/billing/create",      
  BILL_DETAILS: (id: string) => `/billing/${id}`, 
  BILL_EDIT: "/billing/:id/edit",
  BILL_PDF: (id: string) => `/billing/${id}/pdf`,

  USERS: "/users",
  CREATE_USER: "/users/create",
};
