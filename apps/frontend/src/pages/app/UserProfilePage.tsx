import {
  FriendStatusDto,
  PostDto,
  ProfileDto,
  UpdateProfileDto,
  forumFindPostsByUser,
  userFindOne,
  userListFriends,
  userMyFriendRelationship,
  userRemoveFriend,
  userRequestFriend,
  userUpdate,
} from "@alliance/shared/client";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Route } from "../../../.react-router/types/src/pages/app/+types/UserProfilePage";
import { useAppLoaderData } from "../../applayout";
import AppMarkdownWrapper from "../../components/AppMarkdownWrapper";
import ForumListPost from "../../components/ForumListPost";
import FriendRequestButton from "../../components/FriendRequestButton";
import ProfileImage from "../../components/ProfileImage";
import Button, { ButtonColor } from "../../components/system/Button";
import Card, { CardStyle } from "../../components/system/Card";
import UserActivityCard from "../../components/UserActivityCard";
import { useAuth } from "../../lib/AuthContext";
import { getImageSource } from "../../lib/config";
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
  const isMe = id === user?.id.toString();

  const navigate = useNavigate();
  const { profile: myProfile } = useAppLoaderData();
  const [profileUser, setProfileUser] = useState<ProfileDto | null>(
    isMe ? myProfile : null
  );
  const [friendStatus, setFriendStatus] =
    useState<FriendStatusDto["status"]>("none");

  const [selectedTab, setSelectedTab] = useState(ProfileTabs.Activity);
  const [isEditing, setIsEditing] = useState(false);

  const [forumPosts, setForumPosts] = useState<PostDto[]>([]);
  const [friends, setFriends] = useState<ProfileDto[]>([]);

  // Edit mode state
  const [editName, setEditName] = useState<string>(user?.name ?? "");
  const [editBio, setEditBio] = useState<string>(
    myProfile?.profileDescription ?? ""
  );
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(
    myProfile?.profilePicture ?? null
  );
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const {
    activities: completedActions,
    handleLikeActivity,
    updateActivity,
  } = useActivities({
    list: ActivityList.User,
    objectId: parseInt(id!),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const userId = parseInt(id);

        const { data: userData } = await userFindOne({
          path: { id: userId },
        });
        if (userData && userData.displayName) {
          setProfileUser(userData);
          if (isMe) {
            setEditName(userData.displayName);
            setEditBio(userData.profileDescription || "");
            setEditAvatarUrl(userData.profilePicture || null);
          }
        }
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

        const { data: forumPostsData } = await forumFindPostsByUser({
          path: { id: userId },
        });
        if (forumPostsData) {
          setForumPosts(forumPostsData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, user, isMe]);

  // reset tab and edit mode on user change
  useEffect(() => {
    setSelectedTab(ProfileTabs.Activity);
    setIsEditing(false);
  }, [id]);

  const handleSendFriendRequest = useCallback(async () => {
    if (!id || !user) return;
    try {
      await userRequestFriend({ path: { targetUserId: parseInt(id) } });
      setFriendStatus("pending");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  }, [id, user]);

  const handleRemoveFriend = useCallback(async () => {
    if (!id || !user) return;
    try {
      await userRemoveFriend({ path: { targetUserId: parseInt(id) } });
      setFriendStatus("none");
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  }, [id, user]);

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setImageUploadError(null);

    if (!file.type.startsWith("image/")) {
      setImageUploadError("Please select a valid image file.");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setImageUploadError(
        "Image size must be less than 5MB. Please choose a smaller image."
      );
      return;
    }

    setEditAvatarFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user || isSavingProfile) return;

    setIsSavingProfile(true);
    try {
      const payload: UpdateProfileDto = {
        name: editName,
        profileDescription: editBio,
        profilePicture: editAvatarUrl ?? undefined,
      };
      const response = await userUpdate({
        body: payload,
      });

      if (response.data) {
        setProfileUser(response.data);
        setIsEditing(false);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancel = () => {
    if (profileUser) {
      setEditName(profileUser.displayName || "");
      setEditBio(profileUser.profileDescription || "");
      setEditAvatarUrl(profileUser.profilePicture || null);
      setEditAvatarFile(null);
    }
    setImageUploadError(null);
    setIsEditing(false);
  };

  if (!profileUser) {
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
        <Card className="px-8 relative gap-y-2 pb-8">
          {isEditing ? (
            <div className="relative w-fit">
              <img
                src={
                  editAvatarFile
                    ? URL.createObjectURL(editAvatarFile)
                    : editAvatarUrl
                    ? getImageSource(editAvatarUrl)
                    : undefined
                }
                className="mt-[-55px] w-29 h-29 rounded-md object-cover"
              />
              <div className="absolute w-29 h-29 top-[-55px] bg-zinc-50/50 border border-dashed border-zinc-300 rounded-md hover:bg-zinc-100 transition-colors duration-100">
                <label className="cursor-pointer text-zinc-400 underline text-sm absolute m-auto text-center w-full h-full flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden w-full h-full"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-center">Change photo</p>
                </label>
              </div>
              {imageUploadError && (
                <p className="text-red-500 text-sm mt-2">{imageUploadError}</p>
              )}
            </div>
          ) : (
            <ProfileImage
              pfp={profileUser.profilePicture}
              className="mt-[-55px]"
            />
          )}
          <div className="flex gap-2 mt-3">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border-none focus:outline-none !text-[30px] font-bold font-adobe"
              />
            ) : (
              <h1 className="font-adobe">{profileUser.displayName}</h1>
            )}
          </div>
          {/* stats row */}
          <div className="flex flex-row gap-5 cursor-pointer">
            <p onClick={() => setSelectedTab(ProfileTabs.Activity)}>
              <b>{completedActions.length} </b>
              <span className="text-zinc-500">
                action{completedActions.length === 1 ? "" : "s"} completed
              </span>
            </p>
            <p onClick={() => setSelectedTab(ProfileTabs.Forum)}>
              <b>{forumPosts.length} </b>
              <span className="text-zinc-500">
                post{forumPosts.length === 1 ? "" : "s"}
              </span>
            </p>
            <p onClick={() => setSelectedTab(ProfileTabs.Friends)}>
              <b>{friends.length} </b>
              <span className="text-zinc-500">
                friend{friends.length === 1 ? "" : "s"}
              </span>
            </p>
          </div>
          {isEditing ? (
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={6}
              className="w-full border border-stone-300 focus:outline-none p-2 -ml-2 mt-4"
              placeholder="Write something about yourself..."
            />
          ) : (
            profileUser.profileDescription && (
              <AppMarkdownWrapper
                markdownContent={profileUser.profileDescription}
              />
            )
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
              <div className="space-x-3 flex">
                {isEditing ? (
                  <>
                    <Button color={ButtonColor.Light} onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      color={ButtonColor.Blue}
                      onClick={handleSave}
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? "Saving..." : "Save"}
                    </Button>
                  </>
                ) : (
                  <Button
                    color={ButtonColor.Light}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
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
                  handleLike={handleLikeActivity}
                  onActivityUpdate={updateActivity}
                  canEdit={isMe}
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
                    pfp={friend.profilePicture}
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
