import type { MessageDto } from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, href } from "react-router";

const Message = ({
  message,
  className,
  isFirstInGroup,
}: {
  message: MessageDto;
  className?: string;
  isFirstInGroup?: boolean;
}) => {
  const attachments = message.attachments ?? [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxSrc =
    lightboxIndex !== null ? attachments[lightboxIndex] : null;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowRight" && attachments.length > 1) {
        setLightboxIndex((idx) =>
          idx === null ? 0 : (idx + 1 + attachments.length) % attachments.length
        );
      } else if (e.key === "ArrowLeft" && attachments.length > 1) {
        setLightboxIndex((idx) =>
          idx === null ? 0 : (idx - 1 + attachments.length) % attachments.length
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [attachments.length, lightboxIndex]);

  return (
    <>
      <div
        className={`${className} bg-white hover:bg-zinc-100 rounded-md flex flex-row gap-x-3 px-2 py-1 ${
          isFirstInGroup ? "pt-2" : "pt-1"
        }`}
      >
        <div className="w-8 shrink-0 mt-1">
          {isFirstInGroup && (
            <Link to={href("/user/:id", { id: message.author.id.toString() })}>
              <ProfileImage pfp={message.author.profilePicture} size="medium" />
            </Link>
          )}
        </div>
        <div className="flex flex-col -mt-1">
          {isFirstInGroup && (
            <span className="font-semibold">{message.author.displayName}</span>
          )}
          {message.body && <span>{message.body}</span>}
          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachments.map((attachment, idx) => (
                <img
                  key={`${message.id}-attachment-${idx}`}
                  src={attachment}
                  onClick={() => setLightboxIndex(idx)}
                  className="w-28 h-28 object-cover rounded border border-zinc-200 cursor-zoom-in"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              color={ButtonColor.Transparent}
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-1 -right-9 text-white"
              aria-label="Close"
            >
              <X size={20} />
            </Button>
            <img
              src={lightboxSrc}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
