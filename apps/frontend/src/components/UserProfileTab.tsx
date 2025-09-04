interface UserProfileTabProps {
  number: number;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const UserProfileTab: React.FC<UserProfileTabProps> = ({
  number,
  label,
  selected,
  onClick,
}: UserProfileTabProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex gap-x-1 items-center rounded-md py-1.5 px-4 text-sm cursor-pointer ${
        selected ? "bg-green" : "bg-white border border-zinc-200"
      }`}
    >
      <span className={`${selected ? "text-white" : "text-black"}`}>
        {number}
      </span>
      <span className={`${selected ? "text-white/80" : "text-zinc-500"}`}>
        {label}
      </span>
    </div>
  );
};

export default UserProfileTab;
