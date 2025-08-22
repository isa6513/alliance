import { ProfileDto } from "@alliance/shared/client";
import ProfileImage from "./ProfileImage";

export interface ActivityFeedItem {
  title: string;
  content: string;
  user: ProfileDto;
  titleLink?: string;
  showTitle?: boolean;
}

const ActivityFeedItem = ({
  title,
  content,
  user,
  titleLink,
  showTitle = true,
}: ActivityFeedItem) => {
  return (
    <div className="flex flex-row gap-x-2">
      <a href={`/user/${user.id}`} className="flex-shrink-0">
        <ProfileImage pfp={user.profilePicture} size="small" />
      </a>
      <div className="">
        {showTitle && (
          <>
            {titleLink ? (
              <a href={titleLink} className="text-green hover:underline">
                {title}
              </a>
            ) : (
              <p className="text-black">{title}</p>
            )}
          </>
        )}
        <p className="text-zinc-500 text-sm">{content}</p>
      </div>
    </div>
  );
};

export default ActivityFeedItem;
