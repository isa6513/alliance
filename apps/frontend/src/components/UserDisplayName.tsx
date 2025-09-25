interface UserDisplayNameProps extends React.PropsWithChildren {
  staff?: boolean;
  underline?: boolean;
}

const UserDisplayName: React.FC<UserDisplayNameProps> = ({
  children,
  staff = false,
  underline = true,
}: React.PropsWithChildren<UserDisplayNameProps>) => {
  return (
    <>
      <span className={`${underline ? "hover:underline" : ""}`}>
        {children}
      </span>
      {staff && (
        <span className="ml-1 text-xs !bg-staff text-white rounded-xs px-1.5">
          Staff
        </span>
      )}
    </>
  );
};

export default UserDisplayName;
