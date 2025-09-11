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
      <div className="flex-shrink-0 mt-2">
        <Link to={`/user/${user.id}`}>
          <ProfileImage pfp={user.profilePicture} size="medium" />
        </Link>
      </div>
      <div className="">
        {showTitle && (
          <>
            {titleLink ? (
              <Link
                to={titleLink}
                className="text-green font-medium hover:underline"
              >
                {title}
              </Link>
            ) : (
              <p className="text-green font-medium">{title}</p>
            )}
          </>
        )}
        <p className="text-zinc-900">
          <Link to={`/user/${user.id}`}>
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
