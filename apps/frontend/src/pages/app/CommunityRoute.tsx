import Spinner from "@alliance/sharedweb/ui/Spinner";
import { useAuth } from "../../lib/AuthContext";
import CommunityPage from "./CommunityPage";

const CommunityRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return <CommunityPage />;
};

export default CommunityRoute;
