import userImage from "../assets/icons8-user-80.png";

const ProfileImage = ({
  src,
  className,
}: {
  src: string | null;
  className?: string;
}) => {
  return (
    <div
      className={`rounded overflow-hidden bg-white flex items-center justify-center ${className} w-29 h-29`}
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
