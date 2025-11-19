import { OnetimeInviteDto } from "@alliance/shared/client";
import CopyIcon from "@alliance/shared/ui/icons/CopyIcon";
import DeleteIcon from "@alliance/shared/ui/icons/DeleteIcon";

export interface OneTimeInviteListItemProps {
  invite: OnetimeInviteDto;
  onDelete: (inviteId: number) => void;
  onCopy: (code: string) => void;
}

const OneTimeInviteListItem = ({
  invite,
  onDelete,
  onCopy,
}: OneTimeInviteListItemProps) => {
  return (
    <div
      key={invite.id}
      className="flex flex-row gap-x-2 p-4 justify-between items-center"
    >
      <p>{invite.invitee}</p>
      <div className="flex flex-row gap-3 items-center">
        <p className="text-gray-500">{invite.code}</p>
        {invite.isValid ? (
          <p className="text-green">Pending</p>
        ) : (
          <p className="text-gray-500">Accepted</p>
        )}
        <div
          className="cursor-pointer active:scale-85 transition-all duration-100 hover:brightness-50"
          onClick={() => onCopy(invite.code)}
        >
          <CopyIcon size="medium" fill="gray" />
        </div>
        <div
          className="cursor-pointer active:scale-85 transition-all duration-100 hover:brightness-50"
          onClick={() => onDelete(invite.id)}
        >
          <DeleteIcon size="medium" fill="gray" />
        </div>
      </div>
    </div>
  );
};

export default OneTimeInviteListItem;
