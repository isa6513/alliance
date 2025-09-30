// routes/root.tsx
import { Outlet } from "react-router";

export default function AuthOnlyLayout() {
  //   const { isAuthenticated, loading } = useAuth();

  //   if (!isAuthenticated && !loading) {
  //     return <Navigate to="/login" />;
  //   }

  return <Outlet />;
}
