import Spinner from "@alliance/sharedweb/ui/Spinner";
import { useAuth } from "../../lib/AuthContext";
import CommunityPage from "./CommunityPage";

const CommunityRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Spinner />;
  }

  return <CommunityPage />;
};

export default CommunityRoute;
