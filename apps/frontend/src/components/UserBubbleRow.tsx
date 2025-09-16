import UserBubble from "./UserBubble";

interface UserBubbleRowProps {
  n?: number;
  bgColor?: string;
}

const UserBubbleRow = ({ n = 5 }: UserBubbleRowProps) => {
  return (
    <div className="flex flex-row gap-x-2">
      {Array.from({ length: n - 1 }).map((_, i) => (
        <UserBubble clipped={true} key={i} />
      ))}
      <UserBubble clipped={false} />
    </div>
  );
};

export default UserBubbleRow;
