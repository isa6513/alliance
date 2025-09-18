import {
  ProfileDto,
  userAcceptFriendRequest,
  userDeclineFriendRequest,
  userListFriends,
  userListReceivedRequests,
  userListSentRequests,
  userRemoveFriend,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

interface FriendsTabProps {
  userId: number;
  isMe?: boolean;
  originalTab?: "friends" | "received" | "sent";
  friends?: ProfileDto[];
}

const FriendsTab: React.FC<FriendsTabProps> = ({
  userId,
  isMe = false,
  originalTab = "friends",
  friends: initialFriends = [],
}: FriendsTabProps) => {
  const [loading, setLoading] = useState(!!initialFriends.length);
  const [friends, setFriends] = useState<ProfileDto[]>(initialFriends);
  const [receivedRequests, setReceivedRequests] = useState<ProfileDto[]>([]);
  const [sentRequests, setSentRequests] = useState<ProfileDto[]>([]);
  const [activeTab, setActiveTab] = useState<"friends" | "received" | "sent">(
    originalTab
  );
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>(
    {}
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsResponse, receivedResponse, sentResponse] =
        await Promise.all([
          userListFriends({ path: { id: userId } }),
          userListReceivedRequests({}),
          userListSentRequests({}),
        ]);

      setFriends(friendsResponse.data || []);
      setReceivedRequests(receivedResponse.data || []);
      setSentRequests(sentResponse.data || []);
    } catch (error) {
      console.error("Error fetching friend data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startProcessing = (userId: number) => {
    setProcessingIds((prev) => ({ ...prev, [userId]: true }));
  };

  const endProcessing = (userId: number) => {
    setProcessingIds((prev) => ({ ...prev, [userId]: false }));
  };

  const handleAcceptRequest = async (requesterId: number) => {
    console.log("requesterId", requesterId);
    startProcessing(requesterId);

    try {
      const response = await userAcceptFriendRequest({ path: { requesterId } });
      console.log("response", response);
      fetchData();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      endProcessing(requesterId);
    }
  };

  const handleDeclineRequest = async (requesterId: number) => {
    startProcessing(requesterId);

    try {
      await userDeclineFriendRequest({ path: { requesterId } });
      setReceivedRequests((prev) =>
        prev.filter((req) => req.id !== requesterId)
      );
      fetchData();
    } catch (error) {
      console.error("Error declining friend request:", error);
    } finally {
      endProcessing(requesterId);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    startProcessing(friendId);

    try {
      await userRemoveFriend({ path: { targetUserId: friendId } });
      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
      fetchData();
    } catch (error) {
      console.error("Error removing friend:", error);
    } finally {
      endProcessing(friendId);
    }
  };

  const handleCancelRequest = async (userId: number) => {
    startProcessing(userId);

    try {
      await userRemoveFriend({ path: { targetUserId: userId } });
      setSentRequests((prev) => prev.filter((req) => req.id !== userId));
      fetchData();
    } catch (error) {
      console.error("Error canceling friend request:", error);
    } finally {
      endProcessing(userId);
    }
  };

  if (
    loading &&
    !friends.length &&
    !receivedRequests.length &&
    !sentRequests.length
  ) {
    return (
      <Card style={CardStyle.White} className="p-4">
        <p className="text-center text-zinc-500 py-4">Loading friend data...</p>
      </Card>
    );
  }

  return (
    <>
      <div className="flex mb-4">
        <Button
          color={ButtonColor.Transparent}
          className={`px-4 py-2 rounded-none  ${
            activeTab === "friends"
              ? "border-b-1 border-black font-semibold"
              : "text-zinc-500"
          }`}
          onClick={() => setActiveTab("friends")}
        >
          Friends ({friends.length})
        </Button>
        {isMe && (
          <Button
            color={ButtonColor.Transparent}
            className={`px-4 py-2 rounded-none ${
              activeTab === "received"
                ? "border-b-1 border-black font-semibold"
                : "text-zinc-500"
            }`}
            onClick={() => setActiveTab("received")}
          >
            Received Requests ({receivedRequests.length})
          </Button>
        )}
        {isMe && (
          <Button
            color={ButtonColor.Transparent}
            className={`px-4 py-2 rounded-none ${
              activeTab === "sent"
                ? "border-b-1 border-black font-semibold"
                : "text-zinc-500"
            }`}
            onClick={() => setActiveTab("sent")}
          >
            Sent Requests ({sentRequests.length})
          </Button>
        )}
      </div>

      <div className="">
        {activeTab === "friends" && (
          <>
            {friends.length === 0 ? (
              <p className="text-center text-zinc-500 py-4 text-sm">
                You don&apos;t have any friends yet.
              </p>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <Link
                    key={friend.id}
                    className="flex items-center p-3 border border-zinc-300 rounded cursor-pointer hover:border-zinc-500"
                    to={`/user/${friend.id}`}
                  >
                    <ProfileImage
                      size="medium"
                      className="mr-3"
                      pfp={friend.profilePicture}
                    />
                    <div className="flex-grow">
                      <p className="">{friend.displayName}</p>
                    </div>
                    {isMe && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFriend(friend.id);
                        }}
                        color={ButtonColor.Red}
                        disabled={processingIds[friend.id]}
                        className="text-sm bg-transparent hover:!text-red-700"
                      >
                        {processingIds[friend.id]
                          ? "Removing..."
                          : "Remove friend"}
                      </Button>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "received" && (
          <>
            {receivedRequests.length === 0 ? (
              <p className="text-center text-zinc-500 py-4 text-sm">
                No pending friend requests.
              </p>
            ) : (
              <div className="space-y-2">
                {receivedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center p-3 border border-zinc-300 rounded-lg"
                  >
                    <Link
                      to={`/user/${request.id}`}
                      className="flex flex-row flex-2 items-center hover:underline"
                    >
                      <ProfileImage
                        pfp={request.profilePicture}
                        className="!w-12 !h-12 mr-4"
                      />
                      <div className="flex-grow">
                        <p className="font-medium">{request.displayName}</p>
                      </div>
                    </Link>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleAcceptRequest(request.id)}
                        color={ButtonColor.Green}
                        disabled={processingIds[request.id]}
                      >
                        {processingIds[request.id] ? "Processing..." : "Accept"}
                      </Button>
                      <Button
                        onClick={() => handleDeclineRequest(request.id)}
                        color={ButtonColor.Stone}
                        disabled={processingIds[request.id]}
                      >
                        {processingIds[request.id]
                          ? "Processing..."
                          : "Decline"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "sent" && (
          <>
            {sentRequests.length === 0 ? (
              <p className="text-center text-zinc-500 py-4 text-sm">
                You haven&apos;t sent any friend requests.
              </p>
            ) : (
              <div className="space-y-2">
                {sentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center p-3 border border-zinc-300 rounded-lg"
                  >
                    <ProfileImage
                      pfp={request.profilePicture}
                      className="!w-12 !h-12 mr-4"
                    />
                    <div className="flex-grow">
                      <p className="font-medium">{request.displayName}</p>
                    </div>
                    <Button
                      onClick={() => handleCancelRequest(request.id)}
                      color={ButtonColor.Stone}
                      disabled={processingIds[request.id]}
                    >
                      {processingIds[request.id]
                        ? "Canceling..."
                        : "Cancel Request"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default FriendsTab;
