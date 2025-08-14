import heart from "../assets/icons8-heart-90.png";

interface ActivityLikeButtonProps {
  liked: boolean;
  likes: number;
  handleLike: () => void;
  className?: string;
}

const ActivityLikeButton = ({
  liked,
  likes,
  handleLike,
  className,
}: ActivityLikeButtonProps) => {
  return (
    <div className="flex flex-row gap-x-1 items-center">
      <p className="text-sm text-gray-500">{likes}</p>
      <img
        src={heart}
        alt="Like"
        className={`w-4 h-4 cursor-pointer ${className} ${
          liked ? "opacity-60" : "opacity-20  hover:opacity-40"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          handleLike();
        }}
      />
    </div>
  );
};

export default ActivityLikeButton;
