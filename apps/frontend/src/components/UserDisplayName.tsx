interface UserDisplayNameProps extends React.PropsWithChildren {
  staff?: boolean;
}

const UserDisplayName: React.FC<UserDisplayNameProps> = ({
  children,
  staff = false,
}: React.PropsWithChildren<UserDisplayNameProps>) => {
  return (
    <span
      className={`hover:underline ${
        staff ? "text-amber-500 decoration-amber-500" : ""
      }`}
    >
      {children}
    </span>
  );
};

export default UserDisplayName;
