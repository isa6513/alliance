import { Plus } from "lucide-react";
import { ReactNode, useId, useState } from "react";

import { cn } from "@alliance/shared/styles/util";

type ExampleDropdownCardProps = {
  title: ReactNode;
  titleClass?: string;
  /** Shown when expanded. */
  children: ReactNode;
  bgColor?: "grey" | "white";
};

const ExampleDropdownCard: React.FC<ExampleDropdownCardProps> = ({
  title,
  titleClass = "",
  children,
}) => {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <div className={cn("flex flex-col gap-3 rounded-md py-6")}>
      <button
        type="button"
        className="flex w-full flex-row items-center justify-between gap-x-2 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={contentId}
      >
        <span className={cn("min-w-0 font-medium text-zinc-900", titleClass)}>
          {title}
        </span>
        <Plus
          className={cn(
            "h-5 w-5 shrink-0 text-green transition-transform duration-200",
            expanded && "rotate-45",
          )}
          aria-hidden
        />
      </button>
      <div
        id={contentId}
        role="region"
        aria-label="Details"
        hidden={!expanded}
        className="flex flex-col gap-3 text-zinc-500"
      >
        {children}
      </div>
    </div>
  );
};

export default ExampleDropdownCard;
