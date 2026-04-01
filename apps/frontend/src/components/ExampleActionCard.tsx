import { ChevronDown, ChevronRight } from "lucide-react";
import { ReactNode, useId, useState } from "react";

import { Link } from "react-router";
import { cn } from "@alliance/shared/styles/util";
interface ExampleActionCardProps {
  name: string;
  description: ReactNode;
  link: string;
  bgColor?: "grey" | "white";
  dropdown?: boolean;
}

const ExampleActionCard: React.FC<ExampleActionCardProps> = ({
  name,
  description,
  link,
  bgColor = "grey",
  dropdown = false,
}: ExampleActionCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const descriptionId = useId();

  const bgColorClasses = {
    grey: "bg-grey-0 hover:bg-grey-1",
    white: "bg-white hover:bg-green/5",
  };

  const cardClass = cn("rounded p-6", bgColorClasses[bgColor]);

  if (dropdown) {
    return (
      <div className={cn("flex flex-col gap-3", cardClass)}>
        <button
          type="button"
          className="flex w-full flex-row items-center justify-between gap-x-2 text-left"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={descriptionId}
        >
          <span className="min-w-0 font-medium text-green">{name}</span>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-green transition-transform duration-200",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        <div
          id={descriptionId}
          role="region"
          aria-label="Description"
          hidden={!expanded}
          className="flex flex-col gap-3 text-zinc-500"
        >
          <div>{description}</div>
          <Link
            to={link}
            className="w-fit font-medium text-zinc-500 underline flex flex-row items-center gap-x-1"
          >
            Action details
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={link}
      className={cn(
        "flex flex-row items-center justify-between gap-x-3 md:gap-x-4",
        cardClass,
      )}
    >
      <div className="flex flex-row items-start justify-between gap-x-3 md:gap-x-4 ">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-row items-center justify-between gap-x-2">
            <p className="font-medium text-green">{name}</p>
          </div>
          <p className=" text-zinc-500">{description}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-green" aria-hidden />
    </Link>
  );
};

export default ExampleActionCard;
