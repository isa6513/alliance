import { InfoIcon } from "lucide-react";
import { ReactNode } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./HoverCard";

interface InfoTooltipProps {
  content: ReactNode;
  size?: number;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  size = 15,
}: InfoTooltipProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <span className="inline-block cursor-default">
            <InfoIcon className="text-zinc-400" size={size} />
          </span>
        }
      />
      <HoverCardContent>{content}</HoverCardContent>
    </HoverCard>
  );
};

export default InfoTooltip;
