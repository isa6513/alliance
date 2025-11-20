import { ActionUpdateDto } from "../client";
import { formatTime } from "../lib/utils";
import Card, { CardStyle } from "./Card";
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
    <Card className="!py-2 !px-3.5 w-full" style={CardStyle.White}>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-x-2 items-center">
          <p className="font-medium">{update.title}</p>
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
      {!!update.content.body && (
        <EditableContentRenderer content={update.content} />
      )}
    </Card>
  );
};

export default ActionUpdateCard;
