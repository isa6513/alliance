import { InfoIcon } from "lucide-react";
import { ReactNode } from "react";

interface InfoTooltipProps {
  content: ReactNode;
  size?: number;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  size = 15,
}: InfoTooltipProps) => {
  return (
    <div className="relative group">
      <InfoIcon className="text-zinc-400" size={size} />
      <div className="w-64 pointer-events-none absolute top-full mt-1 left-1/2 z-30 -translate-x-1/2 rounded border border-zinc-200 bg-white px-3 py-2 text-[12px] font-medium text-zinc-700 opacity-0 shadow-md/5 transition-opacity duration-150 group-hover:opacity-100">
        {content}
      </div>
    </div>
  );
};

export default InfoTooltip;
