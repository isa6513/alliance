import { FriendStatusDto } from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useState } from "react";

interface FriendRequestButtonProps {
  friendStatus: FriendStatusDto["status"];
  handleSendFriendRequest: () => void;
  handleRemoveFriend: () => void;
}

const FriendRequestButton = ({
  friendStatus,
  handleSendFriendRequest,
  handleRemoveFriend,
}: FriendRequestButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  if (friendStatus === "none") {
    return (
      <Button
        color={ButtonColor.BlueOutline}
        onClick={handleSendFriendRequest}
        className=""
      >
        <span>Send Friend Request</span>
      </Button>
    );
  }
  if (friendStatus === "pending") {
    return (
      <Button color={ButtonColor.Light} onClick={handleSendFriendRequest}>
        <span>Request sent!</span>
      </Button>
    );
  }
  return (
    <Button
      color={isHovered ? ButtonColor.RedOutline : ButtonColor.GreenOutLine}
      onClick={handleRemoveFriend}
      className={`min-w-36`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? "  Remove Friend  " : "You are friends!"}
    </Button>
  );
};

export default FriendRequestButton;
