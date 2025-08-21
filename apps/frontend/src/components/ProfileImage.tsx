import userImage from "../assets/noun-user-icon.svg";
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
    medium: "w-8 h-8",
    large: "w-29 h-29",
  };
  return (
    <img
      src={!!pfp ? getImageSource(pfp) : userImage}
      alt="Profile"
      className={`object-cover bg-white inline rounded ${className} ${
        sizeClass[size]
      } ${!pfp ? "border border-zinc-300" : ""}`}
    />
  );
};

export default ProfileImage;
