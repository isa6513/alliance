import { ReactNode } from "react";
import { MousePointerClick } from "lucide-react";

interface ExampleActionCardProps {
  name: string;
  description: ReactNode;
  purpose?: string;
  imgSrc?: string;
  imgAlt?: string;
}

const ExampleActionCard: React.FC<ExampleActionCardProps> = ({
  name,
  description,
  purpose,
  imgSrc = "",
  imgAlt = "",
}: ExampleActionCardProps) => {
  return (
    <div key={name} className="">
      <div className="flex flex-row items-start justify-between gap-x-3 md:gap-x-4">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={imgAlt || "image"}
            title={imgAlt || "image"}
            className="w-24 md:w-48 h-24 md:h-48 rounded-md"
          />
        ) : (
          <div className="w-24 md:w-48 h-24 md:h-48 flex items-center justify-center rounded-md bg-zinc-100 text-zinc-300">
            <MousePointerClick size={48} />
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-row items-center justify-between gap-x-2">
            <p className="font-semibold text-green">{name}</p>
          </div>
          <p className=" text-zinc-800">{description}</p>

          {purpose && <p className="text-zinc-500 mt-4">{purpose}</p>}
        </div>
      </div>
    </div>
  );
};

export default ExampleActionCard;
