import { ActionDto } from "@alliance/shared/client";
import Button from "@alliance/sharedweb/ui/Button";
import Card, { CardStyle } from "@alliance/sharedweb/ui/Card";
import ReactMarkdown from "react-markdown";

interface ActionTaskPanelActivityProps {
  action: ActionDto;
  onCompleteAction: () => void;
}

const ActionTaskPanelActivity = ({
  action,
  onCompleteAction,
}: ActionTaskPanelActivityProps) => {
  return (
    <Card style={CardStyle.White}>
      <div className="flex flex-col gap-y-2">
        <p className="font-medium text-lg mb-1">
          Complete this action by following these steps
        </p>
        <div className="">
          <p className="text-lg font-semibold">Steps</p>
          <ReactMarkdown>{action.taskContents}</ReactMarkdown>
        </div>
        <div className="flex justify-end">
          <Button onClick={onCompleteAction}>Mark Complete</Button>
        </div>
      </div>
    </Card>
  );
};

export default ActionTaskPanelActivity;
