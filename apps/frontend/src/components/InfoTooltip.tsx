import { InfoIcon } from "lucide-react";
import { ReactNode } from "react";

interface InfoTooltipProps {
  content: ReactNode;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
}: InfoTooltipProps) => {
  return (
    <div className="relative group">
      <InfoIcon className="w-4 h-4 text-zinc-400" />
      <div className="w-64 pointer-events-none absolute top-full mt-1 left-1/2 z-30 -translate-x-1/2 rounded border border-zinc-200 bg-white px-2 py-1 text-[12px] font-medium text-zinc-700 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
        {content}
      </div>
    </div>
  );
};

export default InfoTooltip;
