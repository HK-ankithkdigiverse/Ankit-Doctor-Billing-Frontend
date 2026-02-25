import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useMe } from "../../hooks/useMe";
import NotFound from "../../pages/notFound";
import { ROUTES, STORAGE_KEYS } from "../../constants";
import { clearPostLoginRedirect, readPostLoginRedirect } from "../../utils/authRedirect";

const PublicOnlyRoute: React.FC = () => {
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

  if (me?.isActive === false) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem("token");
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
};

export default PublicOnlyRoute;
