import { ActionDto } from "@alliance/shared/client";
import Card, { CardStyle } from "./system/Card";

export interface ActionTaskPanelCompletedProps {
  action: ActionDto;
}

const ActionTaskPanelCompleted = () => {
  return (
    <Card style={CardStyle.Green}>
      <p className="">
        You&apos;ve completed this action! Thank you for your help.
      </p>
    </Card>
  );
};

export default ActionTaskPanelCompleted;
