import { ReactNode } from "react";

import ExampleDropdownCard from "./ExampleDropdownCard";

interface ExamplePriorityCardProps {
  id: string;
  title: string;
  titleClass?: string;
  description: ReactNode;
  bgColor?: "grey" | "white";
}

const ExamplePriorityCard: React.FC<ExamplePriorityCardProps> = ({
  title,
  titleClass = "",
  description,
  bgColor = "grey",
}: ExamplePriorityCardProps) => {
  return (
    <ExampleDropdownCard
      title={title}
      titleClass={titleClass}
      bgColor={bgColor}
    >
      <div className="min-w-0">{description}</div>
    </ExampleDropdownCard>
  );
};

export default ExamplePriorityCard;
