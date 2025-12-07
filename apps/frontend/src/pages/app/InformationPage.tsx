import React, { useEffect, useState } from "react";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import { href } from "react-router";
import CenterLayout from "@alliance/shared/ui/CenterLayout";
import ResourceButton from "../../components/ResourceButton";
import { actionsAllUpdates, ActionUpdateDto } from "@alliance/shared/client";
import ActionUpdateCard from "@alliance/shared/ui/ActionUpdateCard";

const InformationPage: React.FC = () => {
  useWhiteBackground();

  const [updates, setUpdates] = useState<ActionUpdateDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    actionsAllUpdates().then((response) => {
      if (response.data) {
        setUpdates(response.data);
      } else {
        setError("Failed to load action updates");
      }
    });
  }, []);

  return (
    <CenterLayout>
      <div className="md:mt-8 gap-y-4 flex flex-col text-base md:text-lg">
        <p className="font-serif text-3xl md:text-4xl font-semibold mb-4">
          Information
        </p>

        <p>
          The Alliance is a group of individuals cooperating to improve the
          world. Our four priorities, in no particular order, are:
        </p>

        <ol className="ml-4 list-decimal list-inside flex flex-col gap-y-1">
          <li>Extreme poverty</li>
          <li>Environmental destruction</li>
          <li>Breakdown of democratic institutions</li>
          <li>Unsafe technological development</li>
        </ol>

        <p>
          Right now, we are testing organizational structures and processes. Our
          goal is to ensure we can coordinate effectively before we launch
          publicly and plan large-scale actions.
        </p>

        <h2 className="text-xl font-semibold mt-4">Resources</h2>

        <div className="flex flex-col gap-y-2">
          <ResourceButton to={href("/guide")}>
            <p className="text-base">
              <span className="font-semibold">Our guide</span> describes how we
              work.
            </p>
          </ResourceButton>
          <ResourceButton to={href("/foundation")}>
            <p className="text-base">
              <span className="font-semibold">Our foundation</span> describes
              how we derived our priorities.
            </p>
          </ResourceButton>
          <ResourceButton to={href("/governance")}>
            <p className="text-base">
              <span className="font-semibold">Our governance</span> describes
              office and member obligations.
            </p>
          </ResourceButton>
          <ResourceButton to="mailto:contact@worldalliance.org">
            <p className="text-base">
              <span className="font-semibold">Email the office</span> with
              questions, feedback, or ideas.
            </p>
          </ResourceButton>
        </div>

        <h2 className="text-xl font-semibold mt-4">Action updates</h2>

        <div className="flex flex-col gap-y-2 text-base">
          {updates.map((update) => (
            <ActionUpdateCard
              key={update.id}
              update={update}
              onActionPageTimeline={false}
            />
          ))}
          {error && <p className="text-zinc-500">{error}</p>}
        </div>
      </div>
    </CenterLayout>
  );
};

export default InformationPage;
