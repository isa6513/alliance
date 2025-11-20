import { ActionUpdateDto } from "@alliance/shared/client";
import ActionUpdateCard from "@alliance/shared/ui/ActionUpdateCard";

interface TimelineItemProps {
  highlighted?: boolean;
  title?: string;
  description: string;
  updates?: ActionUpdateDto[];
  time?: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  highlighted = false,
  title,
  description,
  updates,
  time,
}: TimelineItemProps) => {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex flex-row items-center gap-x-2 mt-px">
        <p
          className={`${highlighted ? "font-medium text-green" : "text-black"}`}
        >
          {title}
        </p>
        <p className="text-zinc-500">{time}</p>
      </div>
      {description && (
        <p className="mt-1 text-zinc-500 text-sm">{description}</p>
      )}
      {updates && updates.length > 0 && (
        <div className="flex flex-col gap-y-1.5 mt-2">
          {updates.map((update) => (
            <ActionUpdateCard key={update.id} update={update} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineItem;
