import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, href } from "react-router";
import { actionsAllGeneralUpdates } from "@alliance/shared/client";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import LargeGeneralUpdateCard from "@alliance/sharedweb/ui/LargeGeneralUpdateCard";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import { MoveLeft } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";

const GeneralUpdatesPage: React.FC = () => {
  useWhiteBackground();

  const { data: generalUpdates = [] } = useQuery({
    queryKey: ["actionsAllGeneralUpdates"],
    queryFn: () =>
      actionsAllGeneralUpdates().then((response) => response.data ?? []),
  });

  const { user } = useAuth();

  return (
    <CenterLayout>
      <div className="gap-y-4 flex flex-col text-base md:text-lg">
        <Link to={href("/information")} className="text-link self-start">
          <div className="flex flex-row items-center gap-x-2">
            <MoveLeft size={14} /> Information
          </div>
        </Link>
        <h1 className="text-title">General updates</h1>

        <div className="flex flex-col gap-y-4 text-base">
          {generalUpdates.map((generalUpdate) => (
            <LargeGeneralUpdateCard
              key={generalUpdate.id}
              id={generalUpdate.id}
              title={generalUpdate.name}
              schema={generalUpdate.schema}
              userId={user?.id}
              user={user}
            />
          ))}
        </div>
      </div>
    </CenterLayout>
  );
};

export default GeneralUpdatesPage;
