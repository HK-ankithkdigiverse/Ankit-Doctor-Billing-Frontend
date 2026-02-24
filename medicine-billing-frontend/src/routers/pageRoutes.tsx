import Dashboard from "../pages/dashboard";

// Products
import ProductsList from "../pages/Product/productsList";
import CreateProduct from "../pages/Product/createProduct";
import EditProduct from "../pages/Product/editProduct";

// Companies
import CompaniesList from "../pages/companies/companiesList";
import CreateCompany from "../pages/companies/createCompany";
import CompanyDetails from "../pages/companies/companyDetails";
import EditCompany from "../pages/companies/editCompany";
import CategoriesList from "../pages/categories/categoriesList";
import CreateCategory from "../pages/categories/createCategory";
import EditCategory from "../pages/categories/editCategory";
import Profile from "../pages/Profile/profile";
import EditProfile from "../pages/Profile/editProfile";

// Admin
import Users from "../pages/admin/users";
import CreateUser from "../pages/admin/createUser";

// Auth
import Login from "../pages/auth/login";
import ForgotPassword from "../pages/auth/forgotPassword";
import ResetPassword from "../pages/auth/resetPassword";
import VerifyOtp from "../pages/auth/verifyOtp";

import { ROUTES } from "../constants";
import ProtectedRoute from "../components/protected/protectedRoute";
import PublicOnlyRoute from "../components/protected/publicOnlyRoute";
import Layout from "../components/layout/layout";
import BillDetails from "../pages/billing/billDetails";
import CreateBill from "../pages/billing/createBill";
import BillList from "../pages/billing/billList";
import EditBill from "../pages/billing/editBill";
import NotFound from "../pages/notFound";
export const PageRoutes = [
  /* ============ PUBLIC ============ */
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <Login />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: <ForgotPassword />,
      },
      {
        path: ROUTES.RESET_PASSWORD,
        element: <ResetPassword />,
      },
      {
        path: ROUTES.VERIFY_OTP,
        element: <VerifyOtp />,
      },
    ],
  },

  /* ============ PROTECTED WRAPPER ============ */
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: <Dashboard />,
          },

          /* PRODUCTS */
          {
            path: ROUTES.PRODUCTS,
            element: <ProductsList />,
          },
          {
            path: ROUTES.CREATE_PRODUCT,
            element: <CreateProduct />,
          },
          {
            path: `${ROUTES.PRODUCTS}/:id/edit`,
            element: <EditProduct />,
          },

          /* COMPANIES */
          {
            path: ROUTES.COMPANIES,
            element: <CompaniesList />,
          },
          {
            path: ROUTES.CREATE_COMPANY,
            element: <CreateCompany />,
          },
          {
            path: `${ROUTES.COMPANIES}/:id`,
            element: <CompanyDetails />,
          },
          {
            path: `${ROUTES.COMPANIES}/:id/edit`,
            element: <EditCompany />,
          },

          /* CATEGORIES */
          {
            path: ROUTES.CATEGORIES,
            element: <CategoriesList />,
          },
          {
            path: ROUTES.CREATE_CATEGORY,
            element: <CreateCategory />,
          },
          {
            path: `${ROUTES.CATEGORIES}/:id/edit`,
            element: <EditCategory />,
          },

          /* PROFILE (SELF) */
          {
            path: ROUTES.PROFILE,
            element: <Profile />,
          },
          {
            path: ROUTES.EDITPROFILE,
            element: <EditProfile />,
          },

          /* BILLING */
          {
            path: ROUTES.BILLING,
            element: <BillList />,
          },
          {
            path: ROUTES.CREATE_BILL,
            element: <CreateBill />,
          },
          {
            path: ROUTES.BILL_EDIT,
            element: <EditBill />,
          },
          {
            path: `${ROUTES.BILL_DETAILS(":id")}`,
            element: <BillDetails />,
          },

          /* ADMIN ONLY */
          {
            element: <ProtectedRoute roles={["ADMIN"]} />,
            children: [
              {
                path: ROUTES.USERS,
                element: <Users />,
              },
              {
                path: ROUTES.CREATE_USER,
                element: <CreateUser />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
