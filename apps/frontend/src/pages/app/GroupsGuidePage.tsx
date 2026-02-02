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
        <p>Groups, they exist.</p>
      </div>
    </CenterLayout>
  );
};

export default GroupsGuidePage;
