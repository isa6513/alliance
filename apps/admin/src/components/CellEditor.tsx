/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import type { ColumnMetadataDto } from "@alliance/shared/client/types.gen";
import DateTimePicker from "@alliance/shared/ui/DateTimePicker";
import {
  isTimeOnlyColumn,
  normalizeTimeValue,
  parseTimeInputValue,
  toDatabaseTimeString,
} from "./dbviewer/timeFieldUtils";

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
  const timeOnlyColumn = isTimeOnlyColumn(column);
  const [editValue, setEditValue] = useState(() => {
    if (column.dataType === "json") {
      if (value === null || value === undefined) {
        return "";
      }
      return typeof value === "string" ? value : JSON.stringify(value, null, 2);
    }

    return timeOnlyColumn ? normalizeTimeValue(value) ?? "" : value;
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
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

  const getCurrentInputValue = () => {
    if (
      column.dataType === "json" &&
      inputRef.current instanceof HTMLTextAreaElement
    ) {
      return inputRef.current.value;
    }

    return formatValueForInput(editValue);
  };

  const handleSave = () => {
    const formatted = getCurrentInputValue();
    let parsed: any;

    try {
      parsed = parseValueFromInput(formatted);
    } catch (error) {
      if (column.dataType === "json") {
        setJsonError("Value must be valid JSON.");
        // keep the editor open so the user can correct the value
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
        return;
      }
      throw error;
    }

    setJsonError(null);

    if (timeOnlyColumn) {
      const databaseValue = toDatabaseTimeString(parsed);
      if (databaseValue !== null) {
        onSave(databaseValue);
        return;
      }
      onSave(null);
      return;
    }

    onSave(parsed);
  };

  const handleBlur = () => {
    handleSave();
  };

  const formatValueForInput = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (column.dataType === "json") {
      if (typeof val === "string") {
        return val;
      }
      try {
        return JSON.stringify(val, null, 2);
      } catch {
        return String(val);
      }
    }
    if (timeOnlyColumn) {
      return normalizeTimeValue(val) ?? "";
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
        return JSON.parse(inputVal);

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
          <DateTimePicker
            {...commonProps}
            value={formatValueForInput(editValue)}
            onChange={(change) => setEditValue(change.utcValue || "")}
            className="!w-80 z-100 -ml-6 -mt-2"
          />
        );

      case "datetime":
        if (timeOnlyColumn) {
          return (
            <input
              {...commonProps}
              type="time"
              step="1"
              value={formatValueForInput(editValue)}
              onChange={(e) => {
                const raw = e.target.value;
                if (!raw) {
                  setEditValue("");
                  return;
                }
                const normalized = parseTimeInputValue(raw);
                setEditValue(normalized ?? raw);
              }}
              placeholder="07:00"
            />
          );
        }
        return (
          <DateTimePicker
            {...commonProps}
            value={formatValueForInput(editValue)}
            onChange={(change) => setEditValue(change.utcValue || "")}
            className="!w-80 z-100 -ml-6 -mt-2"
          />
        );

      case "json":
        return (
          <textarea
            {...commonProps}
            rows={3}
            value={formatValueForInput(editValue)}
            onChange={(e) => {
              if (jsonError) {
                setJsonError(null);
              }
              setEditValue(e.target.value);
            }}
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
        {jsonError ? (
          <span className="text-red-600">{jsonError}</span>
        ) : (
          "Enter to save, Esc to cancel"
        )}
      </div>
    </div>
  );
};

export default CellEditor;
