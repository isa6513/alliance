import { ActionUpdateDto } from "../client";
import { formatTime } from "../lib/utils";
import EditableContentRenderer from "./EditableContentRenderer";
import Button, { ButtonColor } from "./Button";
import DatabaseIcon from "./icons/DatabaseIcon";
import { Link } from "react-router";

export interface ActionUpdateCardProps {
  update: ActionUpdateDto;
  onDelete?: () => void;
  admin?: boolean;
}

const ActionUpdateCard = ({
  update,
  onDelete,
  admin = false,
}: ActionUpdateCardProps) => {
  return (
    <div className="flex flex-col border border-zinc-200 rounded divide-y divide-zinc-200 overflow-hidden">
      <div className="p-3 md:p-5 w-full gap-y-1 bg-zinc-50">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row md:gap-x-2 md:items-center">
            <p className="font-medium">
              <span className="text-green">Update:</span> {update.title}
            </p>
            {admin && (
              <Link to={`/database?table=action_update&id=${update.id}`}>
                <DatabaseIcon size="small" />
              </Link>
            )}
            <p className="text-zinc-500">
              {formatTime(new Date(update.date), {
                addSuffix: true,
              })}
            </p>
          </div>
          {onDelete && (
            <Button onClick={onDelete} color={ButtonColor.Black} size="small">
              Delete
            </Button>
          )}
        </div>
      </div>
      <div className="p-3 md:p-5 w-full gap-y-1 bg-white">
        {!!update.content.body && (
          <EditableContentRenderer content={update.content} className="" />
        )}
      </div>
    </div>
  );
};

export default ActionUpdateCard;
