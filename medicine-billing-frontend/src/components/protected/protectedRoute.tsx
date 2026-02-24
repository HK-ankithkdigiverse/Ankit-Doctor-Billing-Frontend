import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../../hooks/useMe";
import { ROUTES, STORAGE_KEYS } from "../../constants";

type ProtectedRouteProps = {
  roles?: string[];
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const { data: me, isLoading } = useMe();

  if (isLoading) return null;

  // not logged in
  if (!me) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // inactive users cannot access protected pages
  if (me.isActive === false) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem("token");
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // role based access
  if (roles && !roles.includes(me.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
