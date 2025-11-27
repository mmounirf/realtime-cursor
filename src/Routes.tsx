import { Navigate, Outlet, useLocation } from "react-router";
import { useAppStore } from "./store/app";
import { Spinner } from "./components/ui/spinner";

export const ProtectedRoute = () => {
  const { auth, authLoading } = useAppStore();
  const location = useLocation();

  if (authLoading) {
    return <Spinner />;
  }

  if (!auth) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const { auth, authLoading } = useAppStore();

  if (authLoading) {
    return <Spinner />;
  }

  if (auth) {
    return <Navigate to="/realtime" replace />;
  }

  return <Outlet />;
};
