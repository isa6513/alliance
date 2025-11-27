import { Navigate, Outlet, href } from "react-router";
import { useAuth } from "./lib/AuthContext";

export default function Onboarding() {
  const { isAuthenticated, user, loading } = useAuth();

  if (!isAuthenticated && !loading) {
    return <Navigate to={href("/login")} />;
  }

  if (user?.onboardingComplete) {
    return <Navigate to={href("/tasks")} />;
  }

  return <Outlet />;
}
