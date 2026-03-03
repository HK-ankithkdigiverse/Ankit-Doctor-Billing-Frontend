import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import NotFound from "../../pages/notFound";
import { ROUTES } from "../../constants";
import { clearStoredToken } from "../../common/helpers/tokenStorage";
import { clearPostLoginRedirect, readPostLoginRedirect } from "../../common/helpers/authRedirect";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  clearAuth,
  selectAuthInitialized,
  selectAuthLoading,
  selectAuthUser,
} from "../../store/slices/authSlice";

export default function PublicOnlyRoute() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const me = useAppSelector(selectAuthUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const isInitialized = useAppSelector(selectAuthInitialized);

  useEffect(() => {
    if (me?.isActive === false) {
      clearStoredToken();
      clearPostLoginRedirect();
      dispatch(clearAuth());
    }
  }, [dispatch, me?.isActive]);

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

  if (me?.isActive === false) {
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

