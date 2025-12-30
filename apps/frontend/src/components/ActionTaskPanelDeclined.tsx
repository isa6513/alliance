import { ActionDto } from "@alliance/shared/client";
import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";

export interface ActionTaskPanelDeclinedProps {
  action: ActionDto;
}

const ActionTaskPanelDeclined = () => {
  return (
    <Card style={CardStyle.Grey}>
      <p className="">You withdrew from this action.</p>
    </Card>
  );
};

export default ActionTaskPanelDeclined;
