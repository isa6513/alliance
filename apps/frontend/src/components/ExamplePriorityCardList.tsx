import React from "react";
import { alliancePriorities } from "../lib/alliancePriorities";
import ExamplePriorityCard from "./ExamplePriorityCard";

interface ExamplePriorityCardListProps {
  bgColor?: "grey" | "white";
  dropdown?: boolean;
}

const ExamplePriorityCardList: React.FC<ExamplePriorityCardListProps> = ({
  bgColor = "grey",
  dropdown = false,
}: ExamplePriorityCardListProps) => {
  return (
    <div className="flex flex-col rounded gap-y-2">
      {alliancePriorities.map((priority) => (
        <ExamplePriorityCard
          bgColor={bgColor}
          key={priority.id}
          id={priority.id}
          title={priority.title}
          description={priority.description}
          dropdown={dropdown}
        />
      ))}
    </div>
  );
};

export default ExamplePriorityCardList;
