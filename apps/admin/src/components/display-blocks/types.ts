import type { DisplayBlock } from "@alliance/shared/forms/display-blocks";
import type { AnyField } from "@alliance/shared/forms/formschema";

export interface BaseDisplayBlockProps<T extends DisplayBlock> {
  block: T;
  onUpdate: (updates: Partial<T>) => void;
  onRemove: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  previousFields?: AnyField[];
}
