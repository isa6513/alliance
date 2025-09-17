interface UserProfileTabProps {
  number: number;
  label: string;
  shortLabel?: string;
  selected: boolean;
  onClick: () => void;
}

const UserProfileTab: React.FC<UserProfileTabProps> = ({
  number,
  label,
  shortLabel,
  selected,
  onClick,
}: UserProfileTabProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex gap-x-1 items-center rounded py-1.5 px-4 text-sm cursor-pointer ${
        selected ? "bg-black" : "bg-white border border-zinc-200"
      }`}
    >
      <span className={`${selected ? "text-white" : "text-black"}`}>
        {number}
      </span>
      <span className={`${selected ? "text-white/90" : "text-zinc-600"}`}>
        <span className="hidden sm:inline">{label}</span>
        <span className="inline sm:hidden">{shortLabel || label}</span>
      </span>
    </div>
  );
};

export default UserProfileTab;
