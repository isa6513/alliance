import ReactMarkdown from "react-markdown";
import Button, { ButtonColor } from "./system/Button";
import Card, { CardStyle } from "./system/Card";
import { ActionDto } from "@alliance/shared/client";

interface ActionTaskPanelActivityProps {
  action: ActionDto;
  onCompleteAction: () => void;
}

const ActionTaskPanelActivity = ({
  action,
  onCompleteAction,
}: ActionTaskPanelActivityProps) => {
  return (
    <Card style={CardStyle.LightGrey}>
      <div className="flex flex-col gap-y-2">
        <p className="text-zinc-500 text-sm">
          This action is awaiting your completion.
        </p>
        <hr className="border-zinc-200" />
        <div className="my-2">
          <p className="text-lg font-semibold">Steps</p>
          <ReactMarkdown>{action.taskContents}</ReactMarkdown>
        </div>
        <div className="flex justify-end">
          <Button color={ButtonColor.Green} onClick={onCompleteAction}>
            Mark Complete
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ActionTaskPanelActivity;
