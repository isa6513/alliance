import {
  FriendStatusDto,
  PostDto,
  ProfileDto,
  UpdateProfileDto,
  UserCommentDto,
  forumFindCommentsByUser,
  forumFindPostsByUser,
  userAcceptFriendRequest,
  userFindOne,
  userListFriends,
  userMyFriendRelationship,
  userMyProfile,
  userRemoveFriend,
  userRequestFriend,
  userUpdate,
} from "@alliance/shared/client";
import AppMarkdownWrapper from "@alliance/shared/ui/AppMarkdownWrapper";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card from "@alliance/shared/ui/Card";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Route } from "../../../.react-router/types/src/pages/app/+types/UserProfilePage";
import { setRevalidate, useAppLoaderData } from "../../applayout";
import ForumListPost from "../../components/ForumListPost";
import FriendRequestButton from "../../components/FriendRequestButton";
import FriendsTab from "../../components/FriendsTab";
import UserActivityCard from "../../components/UserActivityCard";
import UserProfileTab from "../../components/UserProfileTab";
import { useAuth } from "../../lib/AuthContext";
import useActivities, { ActivityList } from "./useActivities";
import { sharp_allowed_mime_types } from "@alliance/shared/lib/config";
import List from "@alliance/shared/ui/List";
import ForumActivityCommentCard from "../../components/ForumActivityCommentCard";
import ProfileImageEditor from "../../components/ProfileImageEditor";
import Spinner from "../../components/Spinner";

enum ProfileTabs {
  Activity = "Actions",
  Forum = "Forum Activity",
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

  const { state } = useLocation();
  const { openFriendRequest } = state || false;
  const { openFriends } = state || false;

  const [profile, setProfile] = useState<ProfileDto | null>(null);
  useAppLoaderData().profile.then((data) => {
    if (!profile && isMe) {
      setProfile(data ?? null);
    }
  });
  const [friendStatus, setFriendStatus] = useState<FriendStatusDto | null>(
    null
  );

  const [selectedTab, setSelectedTab] = useState(ProfileTabs.Activity);

  const [isEditing, setIsEditing] = useState(false);

  const [forumPosts, setForumPosts] = useState<PostDto[]>([]);
  const [forumComments, setForumComments] = useState<UserCommentDto[]>([]);
  const [friends, setFriends] = useState<ProfileDto[] | null>(null);

  // Edit mode state
  const [editName, setEditName] = useState<string>(user?.name ?? "");
  const [editBio, setEditBio] = useState<string>(
    profile?.profileDescription ?? ""
  );
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(
    profile?.profilePicture ?? null
  );
  const [avatarEditorKey, setAvatarEditorKey] = useState(0);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const forumActivityItems = useMemo(() => {
    const postItems = forumPosts.map((post) => ({
      type: "post" as const,
      createdAt: post.createdAt,
      post,
    }));

    const commentItems = forumComments.map((comment) => ({
      type: "comment" as const,
      createdAt: comment.createdAt,
      comment,
    }));

    return [...postItems, ...commentItems].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [forumPosts, forumComments]);

  const forumActivityCount = forumActivityItems.length;

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
      if (!id) return;
      setLoading(true);

      const userId = parseInt(id);

      try {
        const userRes = await userFindOne({
          path: { id: userId },
        });

        if (!userRes.data) {
          setLoading(false);
          return;
        }

        if (userRes.data && userRes.data.displayName) {
          setProfile(userRes.data);
          if (isMe) {
            setEditName(userRes.data.displayName);
            setEditBio(userRes.data.profileDescription || "");
            setEditAvatarUrl(userRes.data.profilePicture || null);
          }
        }

        const results = await Promise.allSettled([
          userMyFriendRelationship({ path: { id: userId } }),
          forumFindPostsByUser({ path: { id: userId } }),
          forumFindCommentsByUser({ path: { id: userId } }),
          userListFriends({ path: { id: userId } }),
        ]);

        const friendRel =
          results[0].status === "fulfilled" ? results[0].value.data : null;
        const posts =
          results[1].status === "fulfilled" ? results[1].value.data : [];
        const comments =
          results[2].status === "fulfilled" ? results[2].value.data : [];
        const friendsList =
          results[3].status === "fulfilled" ? results[3].value.data : [];

        setFriendStatus(friendRel ?? null);
        setForumPosts(posts ?? []);
        setForumComments(comments ?? []);
        setFriends(friendsList ?? []);
      } catch (err) {
        console.error("Failed to load data:", err);
        setProfile(null);
      } finally {
        setLoading(false);
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
    setProfile(null);
    setFriends(null);
    setFriendStatus(null);
    setForumPosts([]);
    setForumComments([]);
  }, [id]);

  useEffect(() => {
    if (openFriendRequest || openFriends) {
      setSelectedTab(ProfileTabs.Friends);
    }
  }, [openFriendRequest, openFriends]);

  const handleSendFriendRequest = useCallback(async () => {
    if (!id || !user) return;
    try {
      await userRequestFriend({ path: { targetUserId: parseInt(id) } });
      setFriendStatus({ status: "pending", didReceiveRequest: false });
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  }, [id, user]);

  const handleAcceptFriendRequest = useCallback(async () => {
    if (!id || !user) return;
    const response = await userAcceptFriendRequest({
      path: { requesterId: parseInt(id) },
    });
    setRevalidate();
    if (!response.error) {
      setFriendStatus({ status: "accepted", didReceiveRequest: false });
    }
    const profile = await userMyProfile();
    if (profile.data) {
      setFriends((prev) => (prev ? [...prev, profile.data] : prev));
    }
  }, [id, user]);

  const navigate = useNavigate();

  const handleRemoveFriend = useCallback(async () => {
    if (!id || !user) return;
    try {
      await userRemoveFriend({ path: { targetUserId: parseInt(id) } });
      setFriendStatus({ status: "none", didReceiveRequest: false });
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  }, [id, user]);

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
        setProfile(response.data);
        setIsEditing(false);
        setRevalidate();
        navigate(`/user/${id}`); // to make navbar pfp reload
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditName(profile.displayName || "");
      setEditBio(profile.profileDescription || "");
      setEditAvatarUrl(profile.profilePicture || null);
    }
    setAvatarEditorKey((prev) => prev + 1);
    setIsEditing(false);
  };

  if (!profile && loading) {
    return (
      <div className="bg-page pt-20 px-8 md:px-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="large" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-page pt-20 px-8 md:px-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-center text-zinc-500">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="mx-2 space-y-2">
        <div className="w-full h-[50px] md:h-[100px]"></div>
        <Card className="px-8 pb-6 relative gap-y-2">
          {isEditing ? (
            <ProfileImageEditor
              key={avatarEditorKey}
              className="mt-[-55px]"
              initialImageUrl={editAvatarUrl}
              onChange={setEditAvatarUrl}
              allowedMimeTypes={sharp_allowed_mime_types}
            />
          ) : (
            <ProfileImage
              pfp={profile.profilePicture}
              size="huge"
              className="mt-[-55px]"
            />
          )}
          <div className="flex gap-2 mt-3">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border-none !bg-zinc-100 px-2 -mx-2 rounded focus:outline-none !text-[30px] !font-semibold font-serif"
              />
            ) : (
              <div className="flex flex-row gap-3 items-center">
                <h1 className="font-serif !font-semibold">
                  {profile.displayName}
                </h1>
                {profile.staff && (
                  <div className="text-sm bg-staff text-white px-3 py-0.5 rounded self-center mt-2">
                    Staff
                  </div>
                )}
                {!profile.contractDateSigned && (
                  <div className="text-sm bg-zinc-100 text-zinc-600 px-3 py-0.5 rounded self-center mt-2">
                    Observer
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={6}
              className="w-full border-none !bg-zinc-100 px-2 -ml-2 rounded focus:outline-none p-2 mb-2"
              placeholder="Write something about yourself..."
            />
          ) : (
            profile.profileDescription && (
              <AppMarkdownWrapper
                markdownContent={profile.profileDescription}
                className="mb-2"
              />
            )
          )}
          {/* stats row */}
          <div
            className={`mt-2 flex flex-row gap-x-2 cursor-pointer transition-none`}
          >
            <UserProfileTab
              number={completedActions.length}
              label={`action${
                completedActions.length === 1 ? "" : "s"
              } completed`}
              shortLabel={`action${completedActions.length === 1 ? "" : "s"}`}
              selected={selectedTab === ProfileTabs.Activity}
              onClick={() => setSelectedTab(ProfileTabs.Activity)}
            />
            <UserProfileTab
              number={forumActivityCount}
              label={forumActivityCount === 1 ? "post" : "posts"}
              selected={selectedTab === ProfileTabs.Forum}
              onClick={() => setSelectedTab(ProfileTabs.Forum)}
            />
            <UserProfileTab
              number={friends?.length ?? 0}
              label={`friend${friends?.length === 1 ? "" : "s"}`}
              selected={selectedTab === ProfileTabs.Friends}
              onClick={() => setSelectedTab(ProfileTabs.Friends)}
            />
          </div>
          {/* button row */}
          <div className="absolute right-0 top-0 space-x-3 flex flex-row p-5">
            {isAuthenticated && !isMe && friendStatus !== null && (
              <>
                <FriendRequestButton
                  friendStatus={friendStatus}
                  handleSendFriendRequest={handleSendFriendRequest}
                  handleRemoveFriend={handleRemoveFriend}
                  handleAcceptFriendRequest={handleAcceptFriendRequest}
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
                  <div className="flex flex-col items-end">
                    <Button
                      color={ButtonColor.Light}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
        <div className="pb-24 mt-2">
          {selectedTab === ProfileTabs.Activity && (
            <List className="mb-10 *:p-4">
              {completedActions.length === 0 && (
                <p className="my-4 text-center text-zinc-500">
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
            </List>
          )}

          {selectedTab === ProfileTabs.Forum && (
            <div className="flex flex-col gap-y-1">
              {forumActivityItems.length === 0 ? (
                <p className="my-4 text-center text-zinc-500">
                  No forum activity yet
                </p>
              ) : (
                <List className="mb-10">
                  {forumActivityItems.map((item) => {
                    if (item.type === "post") {
                      return (
                        <ForumListPost
                          post={item.post}
                          key={`post-${item.post.id}`}
                          showReply={false}
                          showContentPreview
                        />
                      );
                    }
                    return (
                      <ForumActivityCommentCard
                        comment={item.comment}
                        key={`comment-${item.comment.id}`}
                      />
                    );
                  })}
                </List>
              )}
            </div>
          )}

          {selectedTab === ProfileTabs.Friends && (
            <FriendsTab
              userId={profile.id}
              isMe={isMe}
              originalTab={openFriendRequest ? "received" : "friends"}
              friends={friends ?? []}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
