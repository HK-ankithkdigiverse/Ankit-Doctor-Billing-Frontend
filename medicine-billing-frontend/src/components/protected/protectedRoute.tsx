import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useMe } from "../../hooks/useMe";
import { ROUTES, STORAGE_KEYS } from "../../constants";
import { storePostLoginRedirect } from "../../utils/authRedirect";

type ProtectedRouteProps = {
  roles?: string[];
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const location = useLocation();
  const { data: me, isLoading } = useMe();

  if (isLoading) {
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

  // not logged in
  if (!me) {
    const target = `${location.pathname}${location.search}${location.hash}`;
    storePostLoginRedirect(target);
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  // inactive users cannot access protected pages
  if (me.isActive === false) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem("token");
    const target = `${location.pathname}${location.search}${location.hash}`;
    storePostLoginRedirect(target);
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // role based access
  if (roles && !roles.includes(me.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
