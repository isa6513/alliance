import React, { useEffect, useRef, useState } from "react";

interface CommentActionsMenuProps {
  replyId: number;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: (id: number) => void;
}

const CommentActionsMenu: React.FC<CommentActionsMenuProps> = ({
  replyId,
  isOwner,
  onEdit,
  onDelete,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="text-gray-500 hover:text-gray-700 p-1"
        aria-label="More options"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {showDropdown && (
        <div className="absolute right-0 bottom-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[140px]">
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("replyId", replyId.toString());
              navigator.clipboard.writeText(url.toString());
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Copy link
          </button>
          {isOwner && (
            <>
              <button
                onClick={() => {
                  onEdit();
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(replyId);
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentActionsMenu;
