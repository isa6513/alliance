import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

interface InfoResourceCardProps {
  title: string;
  description: string;
  href: string;
}

const InfoResourceCard = ({
  title,
  description,
  href,
}: InfoResourceCardProps) => {
  return (
    <Link
      to={href}
      className="flex flex-row gap-x-2 justify-between items-center group hover:cursor-pointer border-l-2 pl-3 border-green"
    >
      <div>
        <h2 className="text-xl font-medium text-zinc-800 group-hover:underline">
          {title}
        </h2>

        <p className="text-zinc-500">{description}</p>
      </div>
      <ArrowRight size={20} className="text-green" />
    </Link>
  );
};

export default InfoResourceCard;
