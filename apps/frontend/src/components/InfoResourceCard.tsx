import { Link } from "react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";

export interface InfoResourceCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const InfoResourceCard = ({
  title,
  description,
  href,
  icon: Icon,
}: InfoResourceCardProps) => {
  return (
    <Link
      to={href}
      className="flex flex-row gap-x-2 justify-between items-center group hover:cursor-pointer border-l-2 border-transparent pl-3 hover:border-green"
    >
      <div className="flex flex-row gap-x-3 items-center">
        <Icon size={24} className="text-green" />
        <div>
          <h2 className="text-xl font-medium text-zinc-800 group-hover:underline">
            {title}
          </h2>

          <p className="text-zinc-500">{description}</p>
        </div>
      </div>
      <ArrowRight
        size={20}
        className="text-green opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </Link>
  );
};

export default InfoResourceCard;
