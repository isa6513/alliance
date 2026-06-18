import { LikeTargetType, useLikers } from "@alliance/shared/lib/useLikers";
import { Heart } from "lucide-react";
import UserListModal, { UserListContent } from "./UserListModal";

const PAGE_SIZE = 20;

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
    useLikers({ targetType, targetId, limit: PAGE_SIZE, enabled: open });

  const initialLoading = loading && users.length === 0;
  const countLabel = initialLoading
    ? "Likes"
    : hasNextPage
      ? `${users.length}+ likes`
      : users.length === 1
        ? `${users.length} like`
        : `${users.length} likes`;

  return (
    <UserListModal
      open={open}
      onClose={onClose}
      icon={<Heart size={16} fill="#ff3e24" color="#ff3e24" strokeWidth={0} />}
      title={countLabel}
    >
      <UserListContent
        users={users}
        initialLoading={initialLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onNavigate={onClose}
        emptyIcon={
          <Heart size={28} className="text-zinc-300" strokeWidth={1.5} />
        }
        emptyLabel="No likes yet"
      />
    </UserListModal>
  );
};

export default LikesModal;
