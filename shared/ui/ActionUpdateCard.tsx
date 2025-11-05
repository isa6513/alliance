import { CreateActionUpdateDto } from "../client";
import { formatTime } from "../lib/utils";
import Card, { CardStyle } from "./Card";
import EditableContentRenderer from "./EditableContentRenderer";
import Button, { ButtonColor } from "./Button";

export interface ActionUpdateCardProps {
  update: CreateActionUpdateDto;
  onDelete?: () => void;
}

const ActionUpdateCard = ({ update, onDelete }: ActionUpdateCardProps) => {
  return (
    <Card className="gap-2 w-full" style={CardStyle.LightGrey}>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-x-3 items-center">
          <p className="text-zinc-500">
            {formatTime(new Date(update.date), {
              addSuffix: true,
            })}
          </p>
          <p className="font-bold">{update.title}</p>
        </div>
        {onDelete && (
          <Button onClick={onDelete} color={ButtonColor.Black} size="small">
            Delete
          </Button>
        )}
      </div>
      <EditableContentRenderer content={update.content} />
    </Card>
  );
};

export default ActionUpdateCard;
