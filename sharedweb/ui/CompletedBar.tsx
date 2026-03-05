import React from "react";
import { cn } from "@alliance/shared/styles/util";

export interface CompletedBarProps {
  percentage: number;
  dark?: boolean;
  height?: string;
}

const CompletedBar: React.FC<CompletedBarProps> = ({
  percentage,
  dark = false,
  height = "h-3",
}: CompletedBarProps) => {
  return (
    <div
      className={cn(
        "w-full rounded-full outline outline-zinc-200 mt-0.5",
        height,
        dark ? "bg-zinc-200" : "bg-zinc-100"
      )}
    >
      {percentage > 0 && (
        <div
          className={cn(
            height,
            "bg-green outline outline-green rounded-full overflow-hidden"
          )}
          style={{ width: `${percentage}%` }}
        ></div>
      )}
    </div>
  );
};

export default CompletedBar;
