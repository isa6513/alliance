import { DisplayBlock } from "@alliance/common/forms/display-blocks";
import type { AnyField } from "@alliance/common/forms/form-schema";

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

export interface FieldWrapperProps<T extends AnyField | DisplayBlock> {
  field: T;
  onUpdate: (updates: Partial<T>) => void;
  previousFields?: AnyField[];
  onRemove: () => void;
  children: React.ReactNode;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}
