interface TimelineItemProps {
  title?: string;
  description: string;
  time?: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  description,
  time,
}: TimelineItemProps) => {
  return (
    <span>
      <div className="flex flex-col gap-x-2">
        <p className="text-zinc-500 text-sm">{time}</p>
        <p className="font-semibold">{title}</p>
      </div>
      <p className="mt-1 text-sm">{description}</p>
    </span>
  );
};

export default TimelineItem;
