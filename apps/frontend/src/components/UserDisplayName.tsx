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
        <span className="ml-1 text-xs !bg-staff text-white rounded px-1.5">
          Staff
        </span>
      )}
    </>
  );
};

export default UserDisplayName;
