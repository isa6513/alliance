import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import Card, { CardStyle } from "./system/Card";
import Button, { ButtonColor } from "./system/Button";
import {
  userListFriends,
  userListReceivedRequests,
  userListSentRequests,
  userAcceptFriendRequest,
  userDeclineFriendRequest,
  userRemoveFriend,
  ProfileDto,
} from "@alliance/shared/client";
import ProfileImage from "./ProfileImage";

interface FriendsTabProps {
  userId: number;
}

const FriendsTab: React.FC<FriendsTabProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<ProfileDto[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ProfileDto[]>([]);
  const [sentRequests, setSentRequests] = useState<ProfileDto[]>([]);
  const [activeTab, setActiveTab] = useState<"friends" | "received" | "sent">(
    "friends"
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
      <Card style={CardStyle.White} className="p-6">
        <p className="text-center text-stone-500 py-4">
          Loading friend data...
        </p>
      </Card>
    );
  }

  return (
    <>
      <h2 className="text-xl mb-4">Friends</h2>

      <div className="flex mb-4">
        <button
          className={`px-4 py-2 ${
            activeTab === "friends"
              ? "border-b-2 border-black font-bold"
              : "text-stone-500"
          }`}
          onClick={() => setActiveTab("friends")}
        >
          Friends ({friends.length})
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "received"
              ? "border-b-2 border-black font-bold"
              : "text-stone-500"
          }`}
          onClick={() => setActiveTab("received")}
        >
          Received Requests ({receivedRequests.length})
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "sent"
              ? "border-b-2 border-black font-bold"
              : "text-stone-500"
          }`}
          onClick={() => setActiveTab("sent")}
        >
          Sent Requests ({sentRequests.length})
        </button>
      </div>

      <div className="pb-5">
        {activeTab === "friends" && (
          <>
            {friends.length === 0 ? (
              <p className="text-center text-stone-500 py-4">
                You don&apos;t have any friends yet.
              </p>
            ) : (
              <div className="space-y-4">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-500"
                    onClick={() => navigate(`/user/${friend.id}`)}
                  >
                    <ProfileImage
                      className="!w-12 !h-12 mr-4"
                      pfp={friend.profilePicture}
                    />
                    <div className="flex-grow">
                      <p className="font-medium">{friend.displayName}</p>
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "received" && (
          <>
            {receivedRequests.length === 0 ? (
              <p className="text-center text-stone-500 py-4">
                No pending friend requests.
              </p>
            ) : (
              <div className="space-y-4">
                {receivedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center p-3 border border-gray-300 rounded-lg"
                  >
                    <ProfileImage
                      pfp={request.profilePicture}
                      className="!w-12 !h-12 mr-4"
                    />
                    <div className="flex-grow">
                      <p className="font-medium">{request.displayName}</p>
                    </div>
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
              <p className="text-center text-stone-500 py-4">
                You haven&apos;t sent any friend requests.
              </p>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center p-3 border border-gray-300 rounded-lg"
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
