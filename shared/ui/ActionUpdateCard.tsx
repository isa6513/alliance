import { CreateActionUpdateDto } from "../client";
import { formatTime } from "../lib/utils";
import Card, { CardStyle } from "./Card";
import EditableContentRenderer from "./EditableContentRenderer";

export interface ActionUpdateCardProps {
  update: CreateActionUpdateDto;
}

const ActionUpdateCard = ({ update }: ActionUpdateCardProps) => {
  return (
    <Card className="gap-2 w-full" style={CardStyle.LightGrey}>
      <div className="flex flex-row gap-x-3 items-center">
        <p className="text-zinc-500">
          {formatTime(new Date(update.displayDate), {
            addSuffix: true,
          })}
        </p>
        <p className="font-bold">{update.title}</p>
      </div>
      <EditableContentRenderer content={update.content} />
    </Card>
  );
};

export default ActionUpdateCard;
