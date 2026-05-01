import React from "react";
import { alliancePriorities } from "../lib/alliancePriorities";
import ExamplePriorityCard from "./ExamplePriorityCard";

interface ExamplePriorityCardListProps {
  bgColor?: "grey" | "white";
  titleClass?: string;
}

const ExamplePriorityCardList: React.FC<ExamplePriorityCardListProps> = ({
  titleClass = "",
}: ExamplePriorityCardListProps) => {
  return (
    <div className="flex flex-col">
      {alliancePriorities.map((priority, idx) => (
        <React.Fragment key={priority.id}>
          <ExamplePriorityCard
            id={priority.id}
            title={priority.title}
            description={priority.description}
            titleClass={titleClass}
          />
          {idx < alliancePriorities.length - 1 && (
            <div className="h-px bg-zinc-200" aria-hidden />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ExamplePriorityCardList;
