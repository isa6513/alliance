import { useAuth } from "../../lib/AuthContext";
import CommunityPage from "./CommunityPage";
import NoCommunityPage from "./NoCommunityPage";

const CommunityRoute = () => {
  const { user } = useAuth();
  if (!user?.communities.length) {
    return <NoCommunityPage />;
  }
  return <CommunityPage />;
};

export default CommunityRoute;
