/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import type { ColumnMetadataDto } from "@alliance/shared/client/types.gen";

interface CellEditorProps {
  value: any;
  column: ColumnMetadataDto;
  onSave: (newValue: any) => void;
  onCancel: () => void;
}

const CellEditor: React.FC<CellEditorProps> = ({
  value,
  column,
  onSave,
  onCancel,
}) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >(null);

  useEffect(() => {
    // Focus the input when the editor mounts
    if (inputRef.current) {
      inputRef.current.focus();
      if (
        inputRef.current instanceof HTMLInputElement ||
        inputRef.current instanceof HTMLTextAreaElement
      ) {
        inputRef.current.select();
      }
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleSave = () => {
    onSave(editValue);
  };

  const handleBlur = () => {
    handleSave();
  };

  const tryParseDate = (val: unknown): Date | null => {
    if (val instanceof Date) {
      return Number.isNaN(val.getTime()) ? null : val;
    }

    if (typeof val === "string") {
      const trimmed = val.trim();
      if (!trimmed) return null;

      const directParse = new Date(trimmed);
      if (!Number.isNaN(directParse.getTime())) {
        return directParse;
      }

      const normalized = trimmed.includes(" ")
        ? trimmed.replace(" ", "T")
        : trimmed;
      const normalizedParse = new Date(normalized);
      if (!Number.isNaN(normalizedParse.getTime())) {
        return normalizedParse;
      }
    }

    return null;
  };

  const formatDateParts = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return { year, month, day };
  };

  const formatDateInput = (date: Date) => {
    const { year, month, day } = formatDateParts(date);
    return `${year}-${month}-${day}`;
  };

  const formatDateTimeInput = (
    date: Date,
    includeSeconds: boolean
  ): string => {
    const { year, month, day } = formatDateParts(date);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return includeSeconds
      ? `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
      : `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatValueForInput = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (column.dataType === "json") {
      return typeof val === "string" ? val : JSON.stringify(val, null, 2);
    }
    if (column.dataType === "datetime" || column.dataType === "date") {
      const date = tryParseDate(val);

      if (date) {
        if (column.dataType === "date") {
          return formatDateInput(date);
        }

        const originalHasSeconds =
          typeof val === "string" &&
          /:\d{2}:\d{2}/.test(val.replace(" ", "T"));
        const includeSeconds =
          originalHasSeconds ||
          date.getSeconds() !== 0 ||
          date.getMilliseconds() !== 0;

        return formatDateTimeInput(date, includeSeconds);
      }

      if (typeof val === "string") {
        return val;
      }

      return "";
    }
    return String(val);
  };

  const parseValueFromInput = (inputVal: string): any => {
    if (inputVal === "") return null;

    switch (column.dataType) {
      case "number": {
        const num = Number(inputVal);
        return isNaN(num) ? inputVal : num;
      }

      case "boolean":
        return inputVal === "true";

      case "json":
        try {
          return JSON.parse(inputVal);
        } catch {
          return inputVal;
        }

      case "date":
      case "datetime":
        return inputVal;

      default:
        return inputVal;
    }
  };

  // Render different input types based on column data type
  const renderInput = () => {
    const commonProps = {
      ref: inputRef as any,
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
      className:
        "w-full text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
    };

    switch (column.dataType) {
      case "boolean":
        return (
          <select
            {...commonProps}
            value={editValue ? "true" : "false"}
            onChange={(e) => setEditValue(e.target.value === "true")}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );

      case "enum":
        return (
          <select
            {...commonProps}
            value={editValue || ""}
            onChange={(e) => setEditValue(e.target.value)}
          >
            <option value="">-- Select --</option>
            {column.enumValues?.map((enumValue) => (
              <option key={enumValue} value={enumValue}>
                {enumValue}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            {...commonProps}
            type="number"
            value={formatValueForInput(editValue)}
            onChange={(e) => setEditValue(parseValueFromInput(e.target.value))}
          />
        );

      case "date":
        return (
          <input
            {...commonProps}
            type="date"
            value={formatValueForInput(editValue)}
            onChange={(e) => setEditValue(parseValueFromInput(e.target.value))}
          />
        );

      case "datetime":
        return (
          <input
            {...commonProps}
            type="datetime-local"
            value={formatValueForInput(editValue)}
            onChange={(e) => setEditValue(parseValueFromInput(e.target.value))}
          />
        );

      case "json":
        return (
          <textarea
            {...commonProps}
            rows={3}
            value={formatValueForInput(editValue)}
            onChange={(e) => setEditValue(parseValueFromInput(e.target.value))}
            onKeyDown={(e) => {
              // Allow Enter in textarea unless Ctrl+Enter is pressed
              if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                e.preventDefault();
                onCancel();
              }
            }}
          />
        );
      case "uuid":
      case "string":
        if (editValue && editValue.length > 100) {
          return (
            <textarea
              {...commonProps}
              rows={5}
              className="bg-white w-full z-30"
              value={formatValueForInput(editValue)}
              onChange={(e) =>
                setEditValue(parseValueFromInput(e.target.value))
              }
            />
          );
        } else {
          return (
            <input
              {...commonProps}
              type="text"
              value={formatValueForInput(editValue)}
              onChange={(e) =>
                setEditValue(parseValueFromInput(e.target.value))
              }
            />
          );
        }
      default:
        return (
          <input
            {...commonProps}
            type="text"
            value={formatValueForInput(editValue)}
            onChange={(e) => setEditValue(parseValueFromInput(e.target.value))}
          />
        );
    }
  };

  return (
    <div className="absolute top-0 w-full z-10">
      {renderInput()}
      <div className="absolute -bottom-6 left-0 text-xs text-gray-700 bg-white">
        Enter to save, Esc to cancel
      </div>
    </div>
  );
};

export default CellEditor;
