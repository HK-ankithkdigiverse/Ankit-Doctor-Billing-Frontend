import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { ROUTES } from "../../constants";
import { clearStoredToken } from "../../helpers/tokenStorage";
import { hasRequiredRole } from "../../utils/roleAccess";
import { storePostLoginRedirect } from "../../utils/authRedirect";
import { getLoginBlockReason } from "../../utils/authAccess";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  clearAuth,
  selectAuthInitialized,
  selectAuthLoading,
  selectAuthUser,
} from "../../store/slices/authSlice";

type ProtectedRouteProps = {
  roles?: string[];
};

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const me = useAppSelector(selectAuthUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const isInitialized = useAppSelector(selectAuthInitialized);
  const loginBlockReason = getLoginBlockReason(me);

  useEffect(() => {
    if (loginBlockReason) {
      clearStoredToken();
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

  if (!me || loginBlockReason) {
    const target = `${location.pathname}${location.search}${location.hash}`;
    storePostLoginRedirect(target);
    const loginPath = loginBlockReason ? `${ROUTES.LOGIN}?reason=${loginBlockReason}` : ROUTES.LOGIN;
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (!hasRequiredRole(me.role, roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
