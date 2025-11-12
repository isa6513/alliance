interface TimelineItemProps {
  current?: boolean;
  title?: string;
  description: string;
  time?: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  current = false,
  title,
  description,
  time,
}: TimelineItemProps) => {
  return (
    <span>
      <div className="flex flex-col gap-x-2">
        <div className="flex flex-row items-center gap-x-2 mt-px">
          <p className={`${current ? "font-medium text-green" : "text-black"}`}>
            {title}
          </p>
          <p className="text-zinc-500">{time}</p>
        </div>
      </div>
      <p className="mt-1 text-zinc-500 text-sm">{description}</p>
    </span>
  );
};

export default TimelineItem;
