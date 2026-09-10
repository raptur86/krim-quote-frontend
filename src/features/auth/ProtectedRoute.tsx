import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { ROUTES } from "../../app/router/routes";

export function ProtectedRoute() {
  const { admin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p role="status">로그인 상태를 확인하고 있습니다…</p>;
  if (!admin) return <Navigate to={ROUTES.login} replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}
