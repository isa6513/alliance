import { InfoIcon } from "lucide-react";
import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

interface InfoTooltipProps {
  content: ReactNode;
  size?: number;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  size = 15,
}: InfoTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-block cursor-default">
            <InfoIcon className="text-zinc-400" size={size} />
          </span>
        }
      />
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
};

export default InfoTooltip;
