export interface HoverBadgeProps extends React.PropsWithChildren {
  title: string;
}

export const HoverBadge: React.FC<HoverBadgeProps> = ({
  children,
  title,
}: HoverBadgeProps) => {
  return (
    <div className="relative group inline-block">
      <div
        className="absolute top-full mt-1 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded border 
      border-zinc-200 bg-white px-2 py-1 hidden group-hover:block text-black"
      >
        {title}
      </div>
      {children}
    </div>
  );
};
