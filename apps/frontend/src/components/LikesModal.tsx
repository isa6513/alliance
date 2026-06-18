import { LikeTargetType, useLikers } from "@alliance/shared/lib/useLikers";
import { cn } from "@alliance/shared/styles/util";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import UserDisplayName from "@alliance/sharedweb/ui/UserDisplayName";
import { zIndex } from "@alliance/sharedweb/ui/zIndex";
import { Heart, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, href } from "react-router";

export interface LikesModalProps {
  open: boolean;
  onClose: () => void;
  targetType: LikeTargetType;
  targetId: number;
}

const LikesModal = ({
  open,
  onClose,
  targetType,
  targetId,
}: LikesModalProps) => {
  const { users, loading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLikers({ targetType, targetId, enabled: open });

  // Keep pagination state current without recreating the observer callback.
  const paginationRef = useRef({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  paginationRef.current = { fetchNextPage, hasNextPage, isFetchingNextPage };
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const p = paginationRef.current;
        for (const entry of entries) {
          if (entry.isIntersecting && p.hasNextPage && !p.isFetchingNextPage) {
            p.fetchNextPage?.();
          }
        }
      },
      { root: scrollRef.current, rootMargin: "200px" },
    );
    observerRef.current.observe(node);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const initialLoading = loading && users.length === 0;
  const countLabel = initialLoading
    ? "Likes"
    : hasNextPage
      ? `${users.length}+ likes`
      : users.length === 1
        ? `${users.length} like`
        : `${users.length} likes`;

  return createPortal(
    <div
      className={cn(
        zIndex.modal,
        "fixed inset-0 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]",
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center justify-center border-b border-zinc-100 px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            <Heart size={16} fill="#ff3e24" color="#ff3e24" strokeWidth={0} />
            <h2 className="text-[15px] font-semibold text-zinc-900">
              {countLabel}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="absolute right-2 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {initialLoading ? (
            <SkeletonRows />
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <Heart size={28} className="text-zinc-300" strokeWidth={1.5} />
              <p className="text-sm text-zinc-500">No likes yet</p>
            </div>
          ) : (
            <ul className="py-1">
              {users.map((user) => (
                <li key={user.id}>
                  <Link
                    to={href("/member/:id", { id: user.id.toString() })}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-zinc-50"
                  >
                    <AvatarProfile
                      pfp={user.profilePicture}
                      size="large"
                      className="h-11 w-11"
                    />
                    <UserDisplayName
                      staff={user.staff}
                      grouplead={user.isCommunityLeader}
                      underline={false}
                    >
                      <span className="font-semibold text-zinc-900">
                        {user.displayName}
                      </span>
                    </UserDisplayName>
                  </Link>
                </li>
              ))}
              <div ref={sentinelRef} className="h-1" />
              {isFetchingNextPage && <SkeletonRows count={2} />}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <div className="py-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
          <div className="h-11 w-11 animate-pulse rounded bg-zinc-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-200" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default LikesModal;
