import { lazy, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { ROUTES } from "../../constants";
import { clearStoredToken } from "../../utils/tokenStorage";
import { clearPostLoginRedirect, readPostLoginRedirect } from "../../utils/authRedirect";
import { getLoginBlockReason } from "../../utils/authAccess";
import {
  clearAuth,
  selectAuthInitialized,
  selectAuthLoading,
  selectAuthUser,
  useAppDispatch,
  useAppSelector,
} from "../../store";

const NotFound = lazy(() => import("../../pages/notFound"));

export default function PublicOnlyRoute() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const me = useAppSelector(selectAuthUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const isInitialized = useAppSelector(selectAuthInitialized);
  const loginBlockReason = getLoginBlockReason(me);

  useEffect(() => {
    if (loginBlockReason) {
      clearStoredToken();
      clearPostLoginRedirect();
      dispatch(clearAuth());
    }
  }, [dispatch, loginBlockReason]);

  if (!isInitialized || isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--app-bg)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (loginBlockReason) {
    clearPostLoginRedirect();
    return <Outlet />;
  }

  if (me) {
    if (location.pathname === ROUTES.LOGIN || location.pathname === "/login") {
      const redirectTo = readPostLoginRedirect() || ROUTES.DASHBOARD;
      clearPostLoginRedirect();
      return <Navigate to={redirectTo} replace />;
    }
    return <NotFound />;
  }

  return <Outlet />;
}

