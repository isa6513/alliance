import userImage from "../assets/noun-user-icon.svg";
import { getImageSource } from "../lib/config";

const ProfileImage = ({
  pfp,
  className,
  size = "large",
}: {
  pfp: string | null;
  className?: string;
  size?: "mini" | "small" | "medium" | "large" | "huge";
}) => {
  const sizeClass = {
    mini: "w-4 h-4 rounded-sm",
    small: "w-6 h-6 rounded",
    medium: "w-8 h-8 rounded",
    large: "w-10 h-10 rounded",
    huge: "w-29 h-29 rounded",
  };
  return (
    <img
      src={!!pfp ? getImageSource(pfp) : userImage}
      alt="Profile"
      className={`object-cover bg-white inline ${className} ${
        sizeClass[size]
      } ${!pfp ? "border border-zinc-300" : ""}`}
    />
  );
};

export default ProfileImage;
