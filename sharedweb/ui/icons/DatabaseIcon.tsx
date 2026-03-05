import { cn } from "@alliance/shared/styles/util";

const DatabaseIcon = ({
  size = "small",
  fill = "black",
}: {
  size?: "mini" | "small" | "large";
  fill?: string;
}) => {
  const sizeClass = {
    mini: "w-2.5 h-2.5",
    small: "w-3 h-3",
    large: "w-4 h-4",
  };

  return (
    <svg
      className={cn(sizeClass[size])}
      fill="none"
      stroke={fill}
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"></path>
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"></path>
    </svg>
  );
};

export default DatabaseIcon;
