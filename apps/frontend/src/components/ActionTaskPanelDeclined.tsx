import { ActionDto } from "@alliance/shared/client";
import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import { taskWithdrew } from "@alliance/shared/lib/copy";

export interface ActionTaskPanelDeclinedProps {
  action: ActionDto;
}

const ActionTaskPanelDeclined = () => {
  return (
    <Card style={CardStyle.Grey}>
      <p className="">{taskWithdrew}</p>
    </Card>
  );
};

export default ActionTaskPanelDeclined;
