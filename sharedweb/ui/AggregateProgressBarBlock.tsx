import type { AggregateViewSchema } from "@alliance/shared/forms/formschema";
import { formatAggregateValue } from "@alliance/shared/lib/actionAggregates";
import CompletedBar from "./CompletedBar";
import { completedBarPercentage } from "@alliance/shared/lib/utils";

export interface AggregateProgressBarBlockProps {
  view: AggregateViewSchema;
  titleClassName: string;
  captionClassName: string;
  className?: string;
}

/**
 * Single aggregate progress bar + caption; used on action detail and home sidebar.
 */
export default function AggregateProgressBarBlock({
  view,
  titleClassName,
  captionClassName,
  className,
}: AggregateProgressBarBlockProps) {
  const numerator = view.numerator.value ?? 0;
  const denominator = view.denominator.value ?? 0;
  const title = view.title.trim();
  const caption = view.caption.trim();

  return (
    <div className={className}>
      {title ? <p className={titleClassName}>{title}</p> : null}
      <CompletedBar
        percentage={completedBarPercentage(numerator, denominator)}
      />
      <p className={captionClassName}>
        {caption ? <>{`${caption} `}</> : null}
        {`${formatAggregateValue(numerator, view.displayType)} / ${formatAggregateValue(denominator, view.displayType)}`}
      </p>
    </div>
  );
}
