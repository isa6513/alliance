import BottomSpacer from "./BottomSpacer";
import { cn } from "@alliance/shared/styles/util";

export interface CenterLayoutProps extends React.PropsWithChildren {
  className?: string;
  width?: "4xl" | "3xl";
}

const CenterLayout: React.FC<CenterLayoutProps> = ({
  children,
  className,
  width = "3xl",
}) => {
  return (
    <div
      className={cn(
        "flex flex-col",
        width === "4xl" ? "max-w-4xl" : "max-w-3xl",
        "mx-auto px-3 py-6 sm:py-10 md:py-16",
        className
      )}
    >
      {children}
      <BottomSpacer />
    </div>
  );
};

export default CenterLayout;
