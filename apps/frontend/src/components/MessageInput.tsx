import {
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { Plus } from "lucide-react";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";

interface MessageInputProps {
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  attachments: string[];
  setAttachments: Dispatch<SetStateAction<string[]>>;
  onSend: () => void;
  isSending?: boolean;
}

const MessageInput = ({
  message,
  setMessage,
  attachments,
  setAttachments,
  onSend,
  isSending,
}: MessageInputProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canSend = message.trim().length > 0 || attachments.length > 0;

  const readImagesFromFiles = useCallback(async (files: File[]) => {
    const readers: Promise<string>[] = [];
    for (const file of files) {
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
    return Promise.all(readers);
  }, []);

  const handleFilesSelected = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files || files.length === 0) return;
      try {
        const base64s = await readImagesFromFiles(Array.from(files));
        if (base64s.length > 0) {
          setAttachments((prev) => [...prev, ...base64s]);
        }
      } catch (err) {
        console.error("Failed reading image file(s)", err);
      }
    },
    [readImagesFromFiles, setAttachments]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent<HTMLTextAreaElement>) => {
      try {
        const items = Array.from(e.clipboardData?.items ?? []);
        const imageFiles: File[] = [];

        for (const item of items) {
          if (item.kind === "file" && item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) imageFiles.push(file);
          }
        }

        if (imageFiles.length === 0 && e.clipboardData?.files?.length) {
          for (let i = 0; i < e.clipboardData.files.length; i++) {
            const file = e.clipboardData.files[i];
            if (file && file.type.startsWith("image/")) imageFiles.push(file);
          }
        }

        if (imageFiles.length > 0) {
          e.preventDefault();
          await handleFilesSelected(imageFiles);
        }
      } catch (err) {
        console.error("Failed to paste image(s)", err);
      }
    },
    [handleFilesSelected]
  );

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragging(true);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      setIsDragging(false);
    }
  };

  const onDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    await handleFilesSelected(e.dataTransfer?.files ?? null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSending && canSend) {
        onSend();
      }
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="flex flex-col gap-y-3 px-8 bg-white pt-1 pb-17 md:pb-4 relative"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((img, idx) => (
            <div
              key={`${idx}-${img.substring(0, 8)}`}
              className="relative inline-block"
            >
              <img
                src={img}
                className="w-20 h-20 object-cover rounded border border-zinc-200"
              />
              <button
                type="button"
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, i) => i !== idx))
                }
                className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                aria-label="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative border border-zinc-200 rounded-md bg-gray-200/80 focus-within:ring-1 focus-within:ring-zinc-400">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Message"
          className="w-full border-none bg-transparent p-3 text-black resize-none focus:outline-none"
          rows={Math.max(1, Math.min(4, message.split("\n").length || 1))}
        />
        <div className="absolute right-2 top-0 bottom-0 flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleFilesSelected(e.target.files);
              if (e.target) {
                e.target.value = "";
              }
            }}
          />
          <Button
            onClick={triggerFilePicker}
            color={ButtonColor.Transparent}
            className="!px-2"
          >
            <Plus size={18} />
          </Button>
        </div>
      </div>
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 rounded-md pointer-events-none">
          <div className="text-white font-medium">Drop images to attach</div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-sm text-zinc-600 px-1"></div>
    </div>
  );
};

export default MessageInput;
