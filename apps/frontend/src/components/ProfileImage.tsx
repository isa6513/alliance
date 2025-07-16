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
      {src ? (
        <img
          src={src}
          alt="Profile"
          className="object-cover rounded w-full h-full"
        />
      ) : (
        <div className=" bg-stone-300 rounded" />
      )}
    </div>
  );
};

export default ProfileImage;
