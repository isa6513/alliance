import { cn } from "@alliance/shared/styles/util";

interface ClusterTagProps {
  name: string;
  sameAsViewer: boolean;
  className?: string;
}

const ClusterTag: React.FC<ClusterTagProps> = ({
  name,
  sameAsViewer,
  className,
}) => (
  <span
    className={cn(
      "text-xs rounded-xs px-1.5 py-0.5",
      sameAsViewer ? "bg-green/20 text-green" : "bg-zinc-200 text-zinc-600",
      className,
    )}
  >
    {name}
  </span>
);

export default ClusterTag;
