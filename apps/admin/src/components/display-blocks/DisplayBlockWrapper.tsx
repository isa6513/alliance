import { useEffect, useRef, useState } from "react";
import type { DisplayBlock } from "@alliance/shared/forms/display-blocks";
import type { AnyField, Condition } from "@alliance/shared/forms/formschema";
import { ConditionalVisibility } from "../form-fields/CommonControls";

interface DisplayBlockWrapperProps<T extends DisplayBlock = DisplayBlock> {
  children: React.ReactNode;
  onRemove: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  block?: T;
  onUpdate?: (updates: Partial<T>) => void;
  previousFields?: AnyField[];
}

export function DisplayBlockWrapper<T extends DisplayBlock = DisplayBlock>({
  children,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  block,
  onUpdate,
  previousFields,
}: DisplayBlockWrapperProps<T>) {
  const showConditional = Boolean(block && onUpdate);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement | null>(null);
  const [showConditionalVisibilityControl, setShowConditionalVisibilityControl] =
    useState(() => {
      if (!block) return false;
      const conditions = Array.isArray(block.visibleIf)
        ? block.visibleIf.length
        : block?.visibleIf
        ? 1
        : 0;
      return conditions > 0;
    });

  const handleConditionalChange = (updates: { visibleIf?: Condition[] }) => {
    if (onUpdate) {
      onUpdate(updates as Partial<T>);
    }
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current?.contains(event.target as Node)) return;
      setIsMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const conditionCount = Array.isArray(block?.visibleIf)
      ? block?.visibleIf.length
      : block?.visibleIf
      ? 1
      : 0;

    if (conditionCount > 0 && !showConditionalVisibilityControl) {
      setShowConditionalVisibilityControl(true);
    }
  }, [block, showConditionalVisibilityControl]);

  const handleConditionalVisibilityToggle = (checked: boolean) => {
    setShowConditionalVisibilityControl(checked);
    if (!checked) {
      handleConditionalChange({ visibleIf: undefined });
    }
  };

  const showConditionalControls =
    showConditionalVisibilityControl && showConditional;

  return (
    <div
      className={`group relative border rounded-lg p-4 pl-8 transition-all ${
        isDragging
          ? "border-blue-400 shadow-lg opacity-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div
        className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        title="Drag to reorder"
      >
        <div
          className="text-gray-400 hover:text-gray-600 p-1"
          style={{ userSelect: "none" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            style={{ userSelect: "none" }}
          >
            <circle cx="2" cy="2" r="1" />
            <circle cx="6" cy="2" r="1" />
            <circle cx="2" cy="6" r="1" />
            <circle cx="6" cy="6" r="1" />
            <circle cx="2" cy="10" r="1" />
            <circle cx="6" cy="10" r="1" />
          </svg>
        </div>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showConditional && (
          <div className="relative" ref={optionsMenuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="text-gray-500 hover:text-gray-700 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Display block options</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <circle cx="3.5" cy="8" r="1.2" />
                <circle cx="8" cy="8" r="1.2" />
                <circle cx="12.5" cy="8" r="1.2" />
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-2 text-sm shadow-lg">
                <label className="flex cursor-pointer items-center px-3 py-1.5 text-gray-700">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={showConditionalVisibilityControl}
                    onChange={(event) =>
                      handleConditionalVisibilityToggle(event.target.checked)
                    }
                  />
                  Use conditional visibility
                </label>
              </div>
            )}
          </div>
        )}
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50"
          title="Remove field"
        >
          ×
        </button>
      </div>
      <div className={showConditionalControls ? "space-y-3" : undefined}>
        {children}
        {showConditionalControls && (
          <div className="border-t border-gray-200 pt-4">
            <ConditionalVisibility
              field={block as DisplayBlock}
              previousFields={previousFields || []}
              onChange={handleConditionalChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
