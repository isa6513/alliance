import { Earth, UserCircle } from "lucide-react";
import { cn } from "@alliance/shared/styles/util";
import { HoverBadge } from "./HoverBadge";

interface UserDisplayNameProps extends React.PropsWithChildren {
  staff?: boolean;
  grouplead?: boolean;
  expert?: boolean;
  expertLabel?: string;
  underline?: boolean;
  className?: string;
}

const UserDisplayName: React.FC<UserDisplayNameProps> = ({
  children,
  staff = false,
  grouplead = false,
  expert = false,
  expertLabel,
  underline = true,
  className = "",
}: React.PropsWithChildren<UserDisplayNameProps>) => {
  return (
    <span>
      <span className={cn(underline && "hover:underline", className)}>
        {children}
      </span>
      {staff && (
        <HoverBadge title="Office member">
          <Earth
            size={16}
            className="ml-1 text-green inline -mt-px"
            strokeWidth={1.7}
          />
        </HoverBadge>
      )}
      {!staff && grouplead && (
        <HoverBadge title="Leads a member group">
          <UserCircle
            size={16}
            className="ml-1 text-grouplead inline -mt-px"
            strokeWidth={2}
          />
        </HoverBadge>
      )}
      {expert && (
        <span className="ml-1 text-xs !bg-orange-500 text-white rounded-xs px-1.5">
          {expertLabel || "Expert"}
        </span>
      )}
    </span>
  );
};

export default UserDisplayName;
