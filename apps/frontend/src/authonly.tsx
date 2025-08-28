// routes/root.tsx
import { Outlet } from "react-router";
import { useAuth } from "./lib/AuthContext";

export default function AuthOnlyLayout() {
  const { isAuthenticated, loading, user } = useAuth();

  //   if (!isAuthenticated && !loading) {
  //     return <Navigate to="/login" />;
  //   }

  // We're doing onboarding as an action now

  // if (!loading && isAuthenticated && user?.onboardingComplete === false) {
  //   return <Navigate to="/onboarding" />;
  // }

  return <Outlet />;
}
