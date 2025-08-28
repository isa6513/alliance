interface UserDisplayNameProps extends React.PropsWithChildren {
  staff?: boolean;
}

const UserDisplayName: React.FC<UserDisplayNameProps> = ({
  children,
  staff = false,
}: React.PropsWithChildren<UserDisplayNameProps>) => {
  return (
    <>
      <span className={`hover:underline`}>{children}</span>
      {staff && (
        <span className="ml-1 text-xs bg-amber-500 text-white rounded px-1">
          Staff
        </span>
      )}
    </>
  );
};

export default UserDisplayName;
