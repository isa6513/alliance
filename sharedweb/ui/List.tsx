import { cn } from "@alliance/shared/styles/util";

export interface ListProps extends React.PropsWithChildren {
  className?: string;
}

const List: React.FC<ListProps> = ({ children, className }) => {
  if (!children || (Array.isArray(children) && children.length === 0))
    return null;
  return (
    <div
      className={cn(
        "flex flex-col divide-y divide-zinc-200 border border-zinc-200 rounded overflow-hidden bg-white",
        className
      )}
    >
      {children}
    </div>
  );
};

export default List;
