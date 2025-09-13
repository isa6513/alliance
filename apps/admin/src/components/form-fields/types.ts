import { DisplayBlock } from "@alliance/shared/forms/display-blocks";
import type { AnyField } from "@alliance/shared/forms/formschema";

export interface BaseFieldProps<T extends AnyField | DisplayBlock> {
  field: T;
  onUpdate: (updates: Partial<T>) => void;
  onRemove: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  // Fields earlier on the same page; used for conditional visibility
  previousFields?: AnyField[];
}

export interface FieldWrapperProps {
  onRemove: () => void;
  children: React.ReactNode;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}
