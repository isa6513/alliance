import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@alliance/shared/styles/util";

import ExampleDropdownCard from "./ExampleDropdownCard";

interface ExamplePriorityCardProps {
  id: string;
  title: string;
  titleClass?: string;
  description: ReactNode;
  bgColor?: "grey" | "white";
  dropdown?: boolean;
}

const ExamplePriorityCard: React.FC<ExamplePriorityCardProps> = ({
  title,
  titleClass = "",
  description,
  bgColor = "grey",
  dropdown = false,
}: ExamplePriorityCardProps) => {
  if (dropdown) {
    return (
      <ExampleDropdownCard
        title={title}
        titleClass={titleClass}
        bgColor={bgColor}
      >
        <div className="min-w-0">{description}</div>
      </ExampleDropdownCard>
    );
  }

  const shell = cn(
    "rounded p-6",
    bgColor === "grey"
      ? "bg-grey-0 hover:bg-grey-1"
      : "bg-white hover:bg-green/5",
  );

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between gap-x-3 md:gap-x-4",
        shell,
      )}
    >
      <div className="flex flex-row items-start justify-between gap-x-3 md:gap-x-4 ">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-row items-center justify-between gap-x-2">
            <p className={cn("font-medium text-green", titleClass)}>{title}</p>
          </div>
          <div className="text-zinc-500">{description}</div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-green" aria-hidden />
    </div>
  );
};

export default ExamplePriorityCard;
