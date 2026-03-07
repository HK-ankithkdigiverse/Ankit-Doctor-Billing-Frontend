import { lazy } from "react";

import { ROUTES } from "../constants";
import ProtectedRoute from "../components/protected/protectedRoute";
import PublicOnlyRoute from "../components/protected/publicOnlyRoute";
import Layout from "../components/layout/layout";

const Dashboard = lazy(() => import("../pages/Dashboard"));

// Products
const ProductsList = lazy(() => import("../pages/Product/productsList"));
const CreateProduct = lazy(() => import("../pages/Product/createProduct"));
const EditProduct = lazy(() => import("../pages/Product/editProduct"));

// Companies
const CompaniesList = lazy(() => import("../pages/companies/companiesList"));
const CreateCompany = lazy(() => import("../pages/companies/createCompany"));
const CompanyDetails = lazy(() => import("../pages/companies/companyDetails"));
const EditCompany = lazy(() => import("../pages/companies/editCompany"));
const CategoriesList = lazy(() => import("../pages/categories/categoriesList"));
const CreateCategory = lazy(() => import("../pages/categories/createCategory"));
const EditCategory = lazy(() => import("../pages/categories/editCategory"));
const Profile = lazy(() => import("../pages/Profile/profile"));
const EditProfile = lazy(() => import("../pages/Profile/editProfile"));
const ChangePassword = lazy(() => import("../pages/Profile/changePassword"));

// Admin
const Users = lazy(() => import("../pages/admin/users"));
const CreateUser = lazy(() => import("../pages/admin/createUser"));
const EditUser = lazy(() => import("../pages/admin/editUser"));
const MedicalStoresList = lazy(() => import("../pages/medicalStores/medicalStoresList"));
const CreateMedicalStore = lazy(() => import("../pages/medicalStores/createMedicalStore"));
const EditMedicalStore = lazy(() => import("../pages/medicalStores/editMedicalStore"));

// Auth
const Login = lazy(() => import("../pages/auth/login"));
const ForgotPassword = lazy(() => import("../pages/auth/forgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/resetPassword"));
const VerifyOtp = lazy(() => import("../pages/auth/verifyOtp"));

// Billing
const BillDetails = lazy(() => import("../pages/billing/billDetails"));
const CreateBill = lazy(() => import("../pages/billing/createBill"));
const BillList = lazy(() => import("../pages/billing/billList"));
const EditBill = lazy(() => import("../pages/billing/editBill"));

const NotFound = lazy(() => import("../pages/notFound"));

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
          {
            path: ROUTES.CHANGE_PASSWORD,
            element: <ChangePassword />,
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
                path: ROUTES.MEDICAL_STORES,
                element: <MedicalStoresList />,
              },
              {
                path: ROUTES.CREATE_USER,
                element: <CreateUser />,
              },
              {
                path: ROUTES.CREATE_MEDICAL_STORE,
                element: <CreateMedicalStore />,
              },
              {
                path: ROUTES.USER_EDIT,
                element: <EditUser />,
              },
              {
                path: ROUTES.MEDICAL_STORE_EDIT,
                element: <EditMedicalStore />,
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
