import { CreateEditableContentDto } from "@alliance/shared/client";
import React, { useRef, useState } from "react";

interface EditableContentFormProps {
  value: CreateEditableContentDto;
  onChange: (value: CreateEditableContentDto) => void;
  compact?: boolean;
  className?: string;
  placeholder?: string;
}

const EditableContentForm: React.FC<EditableContentFormProps> = ({
  value,
  onChange,
  compact,
  className,
  placeholder,
}) => {
  const [expanded, setExpanded] = useState(!compact);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const handleFilesSelected = async (e: {
    target?: { files: FileList | null };
    dataTransfer?: DataTransfer | null;
  }) => {
    const files = e.target?.files ?? e.dataTransfer?.files ?? null;
    if (!files || files.length === 0) return;

    const readers: Promise<string>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      readers.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
    }

    try {
      const base64s = await Promise.all(readers);
      onChange({
        ...value,
        attachments: [...(value.attachments ?? []), ...base64s],
      });
    } catch (err) {
      console.error("Failed reading image file(s)", err);
    }
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) setIsDragging(false);
  };
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    await handleFilesSelected({ dataTransfer: e.dataTransfer });
  };

  return (
    <div
      className={`relative ${className ?? ""}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <textarea
        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-transparent border-none ${
          expanded ? "" : "resize-none"
        }`}
        rows={expanded ? 3 : 1}
        value={value.body}
        onChange={(e) => onChange({ ...value, body: e.target.value })}
        placeholder={placeholder}
        onFocus={() => {
          setExpanded(true);
        }}
        onBlur={() => {
          if (compact && value.body.length === 0) {
            setExpanded(false);
          }
        }}
      />
      {/* Drag overlay */}
      {expanded && isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 rounded-lg pointer-events-none">
          <div className="text-white font-medium">Drop images to attach</div>
        </div>
      )}
      {/* Image attachments preview */}
      {expanded && value.attachments && value.attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.attachments.map((img, idx) => (
            <div key={idx} className="relative inline-block">
              <img src={img} className="w-20 h-20 object-cover rounded" />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    attachments: value.attachments.filter((_, i) => i !== idx),
                  })
                }
                className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center pl-[0.5px] pb-[1px]"
                aria-label="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditableContentForm;
