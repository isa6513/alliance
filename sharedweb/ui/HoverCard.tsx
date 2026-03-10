import * as React from "react";
import { PreviewCard } from "@base-ui/react/preview-card";
import { cn } from "@alliance/shared/styles/util";

type PositionerProps = React.ComponentProps<typeof PreviewCard.Positioner>;
type Side = NonNullable<PositionerProps["side"]>;
type Align = NonNullable<PositionerProps["align"]>;

function HoverCard({ ...props }: PreviewCard.Root.Props) {
  return <PreviewCard.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  delay = 0,
  closeDelay = 0,
  ...props
}: PreviewCard.Trigger.Props) {
  return (
    <PreviewCard.Trigger
      data-slot="hover-card-trigger"
      delay={delay}
      closeDelay={closeDelay}
      {...props}
    />
  );
}

function HoverCardContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  ...props
}: PreviewCard.Popup.Props & {
  align?: Align;
  alignOffset?: number;
  side?: Side;
  sideOffset?: number;
}) {
  return (
    <PreviewCard.Portal data-slot="hover-card-portal">
      <PreviewCard.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PreviewCard.Popup
          data-slot="hover-card-content"
          className={cn(
            "rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm font-medium text-zinc-700 shadow-sm outline-none transition-opacity duration-100",
            className
          )}
          {...props}
        />
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
