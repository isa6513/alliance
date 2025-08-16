import userImage from "../assets/icons8-user-80.png";

const ProfileImage = ({
  src,
  className,
  size = "large",
}: {
  src: string | null;
  className?: string;
  size?: "small" | "medium" | "large";
}) => {
  const sizeClass = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-29 h-29",
  };
  return (
    <div
      className={`rounded overflow-hidden bg-white flex items-center justify-center ${className} ${sizeClass[size]}`}
    >
      <img
        src={src ?? userImage}
        alt="Profile"
        className="object-cover rounded w-full h-full"
      />
    </div>
  );
};

export default ProfileImage;
