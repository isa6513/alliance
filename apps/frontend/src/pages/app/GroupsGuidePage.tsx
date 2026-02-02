import React from "react";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";

const GroupsGuidePage: React.FC = () => {
  useWhiteBackground();

  return (
    <CenterLayout>
      <div className="gap-y-4 flex flex-col text-base md:text-lg">
        <p className="font-serif text-3xl md:text-4xl font-semibold mb-4">
          Groups
        </p>
        <p>
          The Alliance is organized into accountability groups. Group leads are
          responsible for ensuring group members complete their tasks on time.
          Group members are accountable to their lead.
        </p>
        <p>
          Accountability groups are intended to help the Alliance build a
          culture of trust and reliability, as well as to ensure members are
          supported.
        </p>
      </div>
    </CenterLayout>
  );
};

export default GroupsGuidePage;
