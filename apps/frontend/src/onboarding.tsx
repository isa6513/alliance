import { Navigate, Outlet } from "react-router";
import { useAuth } from "./lib/AuthContext";

export default function Onboarding() {
  const { isAuthenticated, user, loading } = useAuth();

  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" />;
  }

  if (user?.onboardingComplete) {
    return <Navigate to="/tasks" />;
  }

  return <Outlet />;
}
