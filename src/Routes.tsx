import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "./store/auth";
import { Spinner } from "./components/ui/spinner";

export const ProtectedRoute = () => {
  const { session, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <Spinner />;
  }

  if (!session) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const { session, isLoading } = useAuthStore();

  if (isLoading) {
    return <Spinner />;
  }

  if (session) {
    return <Navigate to="/realtime" replace />;
  }

  return <Outlet />;
};
