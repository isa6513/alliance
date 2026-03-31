import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

import { Link } from "react-router";
import { cn } from "@alliance/shared/styles/util";
interface ExampleActionCardProps {
  name: string;
  description: ReactNode;
  link: string;
  bgColor?: "grey" | "white";
}

const ExampleActionCard: React.FC<ExampleActionCardProps> = ({
  name,
  description,
  link,
  bgColor = "grey",
}: ExampleActionCardProps) => {
  const bgColorClasses = {
    grey: "bg-grey-0 hover:bg-grey-1",
    white: "bg-white hover:bg-green/5",
  };

  return (
    <Link
      to={link}
      key={name}
      className={cn(
        "flex flex-row items-center justify-between gap-x-3 md:gap-x-4 p-6 rounded",
        bgColorClasses[bgColor],
      )}
    >
      <div className="flex flex-row items-start justify-between gap-x-3 md:gap-x-4 ">
        <div className="flex-1 flex flex-col">
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
