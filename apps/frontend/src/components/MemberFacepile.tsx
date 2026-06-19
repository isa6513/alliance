import { ProfileDto } from "@alliance/shared/client";
import { FeedMemberSource } from "@alliance/shared/lib/useFeedMembers";
import { cn } from "@alliance/shared/styles/util";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import { useState } from "react";
import MembersModal from "./MembersModal";

interface MemberFacepileProps {
  users: ProfileDto[];
  max?: number;
  className?: string;
}

/** Avatar cluster; users with photos appear first. */
const MemberFacepile = ({ users, max = 3, className }: MemberFacepileProps) => {
  const display = [...users]
    .sort((a, b) => (b.profilePicture ? 1 : 0) - (a.profilePicture ? 1 : 0))
    .slice(0, max);

  if (display.length === 0) return null;

  return (
    <span className={cn("flex items-center -space-x-2", className)}>
      {display.map((user) => (
        <AvatarProfile
          key={user.id}
          pfp={user.profilePicture ?? null}
          size="small"
        />
      ))}
    </span>
  );
};

interface MemberFacepileButtonProps {
  users: ProfileDto[];
  source: FeedMemberSource;
  label: string;
  modalTitle?: string;
  max?: number;
}

/** Facepile label that opens the full member list. */
export const MemberFacepileButton = ({
  users,
  source,
  label,
  modalTitle,
  max,
}: MemberFacepileButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 align-middle hover:text-zinc-900"
      >
        <MemberFacepile users={users} max={max} className="inline-flex" />
        <span className="font-medium">{label}</span>
      </button>
      <MembersModal
        open={open}
        onClose={() => setOpen(false)}
        source={source}
        title={modalTitle ?? label}
      />
    </>
  );
};

export default MemberFacepile;
