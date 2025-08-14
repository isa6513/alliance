import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Card, { CardStyle } from "../../components/system/Card";
import Button, { ButtonColor } from "../../components/system/Button";
import { useAuth } from "../../lib/AuthContext";
import {
  userFindOne,
  userRequestFriend,
  userListFriends,
  userMyFriendRelationship,
  FriendStatusDto,
  ProfileDto,
  PostDto,
  forumFindPostsByUser,
  userRemoveFriend,
  actionsActionRelations,
  UserActionDto,
} from "@alliance/shared/client";
import ProfileImage from "../../components/ProfileImage";
import UserActivityCard from "../../components/UserActivityCard";
import ForumListPost from "../../components/ForumListPost";
import FriendRequestButton from "../../components/FriendRequestButton";
import { Route } from "../../../.react-router/types/src/pages/app/+types/UserProfilePage";
import useActivities, { ActivityList } from "./useActivities";

enum ProfileTabs {
  Activity = "Actions",
  Forum = "Posts",
  Friends = "Friends",
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error(error);
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
      <div>
        <span className="font-bold pb-2 text-red-500">Error</span>
        <p>Failed to load user profile</p>
      </div>
    </div>
  );
}

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState<ProfileDto | null>(null);
  const [friendStatus, setFriendStatus] =
    useState<FriendStatusDto["status"]>("none");
  const [isMe, setIsMe] = useState(false);
  const [selectedTab, setSelectedTab] = useState(ProfileTabs.Activity);

  const [forumPosts, setForumPosts] = useState<PostDto[]>([]);
  const [friends, setFriends] = useState<ProfileDto[]>([]);
  const [actionRelations, setActionRelations] = useState<
    Map<number, UserActionDto>
  >(new Map());

  const { activities: completedActions, handleLikeActivity } = useActivities({
    list: ActivityList.User,
    objectId: parseInt(id!),
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!id) return;

        const userId = parseInt(id);

        const { data: userData } = await userFindOne({
          path: { id: userId },
        });
        if (userData && userData.displayName) {
          setProfileUser(userData);
        }
        setIsMe(userData?.id === user?.id);

        const { data: friendsData } = await userListFriends({
          path: { id: userId },
        });
        if (friendsData) {
          setFriends(friendsData);
        }
        const { data: friendStatusData } = await userMyFriendRelationship({
          path: { id: userId },
        });
        setFriendStatus(friendStatusData?.status ?? "none");

        const { data: actionRelationsData } = await actionsActionRelations({
          path: { id: userId },
        });
        if (actionRelationsData) {
          const relationMap = new Map<number, UserActionDto>();
          actionRelationsData?.forEach((relation) => {
            relationMap.set(relation.actionId, relation);
          });
          setActionRelations(relationMap);
        }

        const { data: forumPostsData } = await forumFindPostsByUser({
          path: { id: userId },
        });
        if (forumPostsData) {
          setForumPosts(forumPostsData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, user]);

  // reset tab on user change
  useEffect(() => {
    setSelectedTab(ProfileTabs.Activity);
  }, [id]);

  const handleSendFriendRequest = async () => {
    if (!id || !user) return;
    try {
      await userRequestFriend({ path: { targetUserId: parseInt(id) } });
      setFriendStatus("pending");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleRemoveFriend = async () => {
    if (!id || !user) return;
    try {
      await userRemoveFriend({ path: { targetUserId: parseInt(id) } });
      setFriendStatus("none");
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-page pt-20 px-8 md:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="w-full h-[900px]"></div>
          <Card style={CardStyle.White} className="p-8">
            <p className="text-center text-stone-500">Loading profile...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="bg-page pt-20 px-8 md:px-16">
        <div className="max-w-4xl mx-auto">
          <Card style={CardStyle.White} className="p-8">
            <p className="text-center text-stone-500">User not found</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="mx-2 space-y-2">
        <div className="w-full h-[100px]"></div>
        <Card className="px-8 relative space-y-2 pb-8">
          <ProfileImage
            src={profileUser.profilePicture ? profileUser.profilePicture : null}
            className="mt-[-55px]"
          />
          <div className="flex gap-2">
            <h1>{profileUser.displayName}</h1>
          </div>
          {/* stats row */}
          <div className="flex flex-row gap-5 cursor-pointer">
            <p onClick={() => setSelectedTab(ProfileTabs.Activity)}>
              <b>{completedActions.length} </b>
              <span className="text-zinc-500">actions completed</span>
            </p>
            <p onClick={() => setSelectedTab(ProfileTabs.Forum)}>
              <b>{forumPosts.length} </b>
              <span className="text-zinc-500">posts</span>
            </p>
            <p onClick={() => setSelectedTab(ProfileTabs.Friends)}>
              <b>{friends.length} </b>
              <span className="text-zinc-500">friends</span>
            </p>
          </div>
          {profileUser.profileDescription && (
            <p className="mt-6">{profileUser.profileDescription}</p>
          )}
          {/* button row */}
          <div className="absolute right-0 top-0 space-x-3 flex flex-row p-5">
            {isAuthenticated && !isMe && (
              <>
                <FriendRequestButton
                  friendStatus={friendStatus}
                  handleSendFriendRequest={handleSendFriendRequest}
                  handleRemoveFriend={handleRemoveFriend}
                />
                {/* <Button
                  color={ButtonColor.Light}
                  onClick={() => {}}
                  className="!p-[8px] rounded-full"
                >
                  <img src={dots} alt="send" className="w-7 h-7" />
                </Button> */}
              </>
            )}
            {isMe && (
              <Button
                color={ButtonColor.Light}
                className=""
                onClick={() => navigate(`/editprofile`)}
              >
                Edit Profile
              </Button>
            )}
          </div>
          {/* <div className="absolute -left-20 top-0 p-5">
          <BackButton />
          </div> */}
          {/* <ImpactPanel
            completedActions={completedActions}
            isMe={isMe}
            referredCount={referredCount}
          /> */}
        </Card>
        <div className="flex flex-row w-full justify-evenly">
          {[ProfileTabs.Activity, ProfileTabs.Forum].map((tab) => (
            <div
              onClick={() => setSelectedTab(tab)}
              key={tab}
              className={`${
                selectedTab === tab ? "font-bold underline" : "text-gray-800"
              } flex-1 text-center py-3 pt-4 cursor-pointer hover:underline`}
            >
              <p className="text-md">{tab}</p>
            </div>
          ))}
        </div>
        <div className="py-3">
          {selectedTab === ProfileTabs.Activity && (
            <div className="space-y-2">
              {completedActions.length === 0 && (
                <p className="text-center text-stone-500">
                  No actions completed yet
                </p>
              )}
              {completedActions?.map((activity) => (
                <UserActivityCard
                  activity={activity}
                  key={activity.id}
                  relation={actionRelations.get(activity.actionId)}
                  handleLike={handleLikeActivity}
                />
              ))}
            </div>
          )}
          {selectedTab === ProfileTabs.Forum && (
            <div className="flex flex-col gap-y-1">
              {forumPosts.length === 0 && (
                <p className="text-center text-stone-500">No forum posts yet</p>
              )}
              {forumPosts?.map((post: PostDto) => (
                <ForumListPost post={post} key={post.id} />
              ))}
            </div>
          )}
          {selectedTab === ProfileTabs.Friends && (
            <Card className="justify-center">
              {friends.length === 0 && (
                <p className="text-center text-stone-500">No friends yet</p>
              )}
              {friends?.map((friend: ProfileDto) => (
                <div
                  className="flex flex-row gap-2 items-center cursor-pointer hover:bg-stone-200 rounded-md p-3 px-5 w-fit"
                  onClick={() => navigate(`/user/${friend.id}`)}
                  key={friend.id}
                >
                  <ProfileImage
                    src={friend.profilePicture}
                    className="!w-10 !h-10"
                  />
                  <p>{friend.displayName}</p>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
