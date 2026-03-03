import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { ROUTES } from "../../constants";
import { clearStoredToken } from "../../common/helpers/tokenStorage";
import { hasRequiredRole } from "../../common/helpers/roleAccess";
import { storePostLoginRedirect } from "../../common/helpers/authRedirect";
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

  useEffect(() => {
    if (me?.isActive === false) {
      clearStoredToken();
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

  if (!me || me.isActive === false) {
    const target = `${location.pathname}${location.search}${location.hash}`;
    storePostLoginRedirect(target);
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (!hasRequiredRole(me.role, roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

