/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import type { ColumnMetadataDto } from "@alliance/shared/client/types.gen";
import DateTimePicker from "@alliance/shared/ui/DateTimePicker";

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

  const formatValueForInput = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (column.dataType === "json") {
      return typeof val === "string" ? val : JSON.stringify(val, null, 2);
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
          <DateTimePicker
            {...commonProps}
            value={formatValueForInput(editValue)}
            onChange={(change) => setEditValue(change.utcValue || "")}
            className="!w-80 z-100 -ml-6 -mt-2"
          />
        );

      case "datetime":
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
