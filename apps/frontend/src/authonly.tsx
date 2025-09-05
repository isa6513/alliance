// routes/root.tsx
import { Outlet } from "react-router";

export default function AuthOnlyLayout() {
  //   if (!isAuthenticated && !loading) {
  //     return <Navigate to="/login" />;
  //   }

  // We're doing onboarding as an action now

  // if (!loading && isAuthenticated && user?.onboardingComplete === false) {
  //   return <Navigate to="/onboarding" />;
  // }

  return <Outlet />;
}
