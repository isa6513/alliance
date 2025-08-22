import { ProfileDto } from "@alliance/shared/client";
import ActivityLikeButton from "./ActivityLikeButton";
import UserProfilePicRow from "./UserProfilePicRow";

interface ActivityLikesButtonRowProps {
  isLiked: boolean;
  handleLike: (() => void) | null;
  labelText?: boolean;
  likes: ProfileDto[];
}
const ActivityLikesButtonRow = ({
  isLiked,
  likes,
  handleLike,
  labelText = false,
}: ActivityLikesButtonRowProps) => {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-x-2">
      <ActivityLikeButton
        liked={isLiked}
        likes={likes.length}
        handleLike={handleLike}
        labelText={labelText}
      />
      <UserProfilePicRow users={likes} />
    </div>
  );
};

export default ActivityLikesButtonRow;
