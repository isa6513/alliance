import { ProfileDto } from "@alliance/shared/client";
import ProfileImage from "./ProfileImage";

export interface ActivityFeedItem {
  title: string;
  content: string;
  user: ProfileDto;
  titleIsLink?: boolean;
  showTitle?: boolean;
}

const ActivityFeedItem = ({
  title,
  content,
  user,
  titleIsLink = true,
  showTitle = true,
}: ActivityFeedItem) => {
  return (
    <div className="flex flex-row gap-x-2">
      <ProfileImage pfp={user.profilePicture} size="small" />

      <div className="text-sm">
        {showTitle && (
          <>
            {titleIsLink ? (
              <p className="text-green hover:underline">{title}</p>
            ) : (
              <p className="text-black">{title}</p>
            )}
          </>
        )}
        <p className="text-zinc-500">{content}</p>
      </div>
    </div>
  );
};

export default ActivityFeedItem;
