import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useMe } from "../../hooks/useMe";
import NotFound from "../../pages/notFound";
import { ROUTES } from "../../constants";

const PublicOnlyRoute: React.FC = () => {
  const location = useLocation();
  const { data: me, isLoading } = useMe();

  if (isLoading) return null;

  if (me) {
    if (location.pathname === ROUTES.LOGIN || location.pathname === "/login") {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
    return <NotFound />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
