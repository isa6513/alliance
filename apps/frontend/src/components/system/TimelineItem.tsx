import { ActionUpdateDto } from "@alliance/shared/client";
import ActionUpdateCard from "@alliance/sharedweb/ui/ActionUpdateCard";

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
  const sortedUpdates = [...(updates ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex flex-col md:flex-row md:items-center md:gap-x-2 mt-px">
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
          {sortedUpdates?.map((update) => (
            <ActionUpdateCard key={update.id} update={update} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineItem;
