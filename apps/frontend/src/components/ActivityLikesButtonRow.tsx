import { ProfileDto } from "@alliance/shared/client";
import ActivityLikeButton from "./ActivityLikeButton";
import ProfileImage from "./ProfileImage";

interface ActivityLikesButtonRowProps {
  isLiked: boolean;
  handleLike: () => void;
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
      <div className="flex flex-row items-center gap-x-1">
        {likes.slice(0, 5).map((like) => (
          <a
            href={`/user/${like.id}`}
            key={like.id}
            className="flex items-center"
          >
            <ProfileImage pfp={like.profilePicture!} size="small" />
          </a>
        ))}
        {likes.length > 5 && (
          <span className="text-sm text-zinc-500">
            +{likes.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
};

export default ActivityLikesButtonRow;
