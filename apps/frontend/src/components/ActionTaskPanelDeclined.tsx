import { ActionDto } from "@alliance/shared/client";
import Card, { CardStyle } from "@alliance/shared/ui/Card";

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
