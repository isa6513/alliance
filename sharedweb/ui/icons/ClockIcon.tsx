import { cn } from "@alliance/shared/styles/util";

const CheckIcon = ({
  size = "small",
  fill = "var(--color-green)",
}: {
  size?: "xs" | "small" | "large";
  fill?: string;
}) => {
  const sizeClass = {
    xs: "w-3 h-3",
    small: "w-4 h-4",
    large: "w-8 h-8",
  };

  return (
    <svg
      viewBox="0 0 95 95"
      className={cn(sizeClass[size])}
      fill={fill}
      aria-label="Clock"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M47.5 0C21.3 0 0 21.3 0 47.5C0 73.7 21.3 95 47.5 95C73.7 95 95 73.7 95 47.5C95 21.3 73.7 0 47.5 0ZM66.2 60.6C65.3 61.9 63.9 62.6 62.4 62.6C61.5 62.6 60.5 62.3 59.7 61.8L44.8 51.3C43.6 50.4 42.8 49 42.8 47.5V22.4C42.8 19.8 44.9 17.7 47.5 17.7C50.1 17.7 52.2 19.8 52.2 22.4V45.1L65.1 54.2C67.2 55.6 67.7 58.5 66.2 60.6Z" />
    </svg>
  );
};

export default CheckIcon;
