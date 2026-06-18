import {
  FeedMemberSource,
  useFeedMembers,
} from "@alliance/shared/lib/useFeedMembers";
import { Users } from "lucide-react";
import UserListModal, { UserListContent } from "./UserListModal";

const PAGE_SIZE = 20;

export interface MembersModalProps {
  open: boolean;
  onClose: () => void;
  source: FeedMemberSource;
  title: string;
}

/** Paged member list for a global-feed item. */
const MembersModal = ({ open, onClose, source, title }: MembersModalProps) => {
  const { users, loading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeedMembers({ source, limit: PAGE_SIZE, enabled: open });

  const initialLoading = loading && users.length === 0;

  return (
    <UserListModal
      open={open}
      onClose={onClose}
      icon={<Users size={16} className="text-green" strokeWidth={2} />}
      title={title}
    >
      <UserListContent
        users={users}
        initialLoading={initialLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onNavigate={onClose}
        emptyIcon={
          <Users size={28} className="text-zinc-300" strokeWidth={1.5} />
        }
        emptyLabel="No members yet"
      />
    </UserListModal>
  );
};

export default MembersModal;
