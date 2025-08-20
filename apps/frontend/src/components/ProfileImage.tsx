import userImage from "../assets/icons8-user-80.png";
import { getImageSource } from "../lib/config";

const ProfileImage = ({
  pfp,
  className,
  size = "large",
}: {
  pfp: string | null;
  className?: string;
  size?: "small" | "medium" | "large";
}) => {
  const sizeClass = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-29 h-29",
  };
  return (
    <img
      src={!!pfp ? getImageSource(pfp) : userImage}
      alt="Profile"
      className={`object-cover rounded ${className} ${sizeClass[size]} inline`}
    />
  );
};

export default ProfileImage;
