import { ProfileDto } from "@alliance/shared/client";
import { Link } from "react-router";
import ProfileImage from "./ProfileImage";
import UserDisplayName from "./UserDisplayName";

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
      <div className="flex-shrink-0">
        <Link to={`/user/${user.id}`}>
          <ProfileImage pfp={user.profilePicture} size="small" />
        </Link>
      </div>
      <div className="">
        {showTitle && (
          <>
            {titleLink ? (
              <Link to={titleLink} className="text-green hover:underline">
                {title}
              </Link>
            ) : (
              <p className="text-black">{title}</p>
            )}
          </>
        )}
        <p className="text-zinc-500">
          <Link to={`/user/${user.id}`} className="text-zinc-700">
            <UserDisplayName staff={user.staff}>
              {user.displayName}
            </UserDisplayName>
          </Link>{" "}
          {content}
        </p>
      </div>
    </div>
  );
};

export default ActivityFeedItem;
