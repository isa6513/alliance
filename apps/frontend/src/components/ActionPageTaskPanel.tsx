import { UserActionRelation } from "@alliance/shared/client";
import Card from "@alliance/shared/ui/Card";
import { isRouteErrorResponse, useOutletContext } from "react-router";
import { Route } from "../../.react-router/types/src/components/+types/ActionPageTaskPanel";
import { useActionLoaderData } from "../pages/app/ActionPage";
import ActionTaskPanel, { ActionTaskPanelProps } from "./ActionTaskPanel";
import ActionTaskPanelCompleted from "./ActionTaskPanelCompleted";
import ActionTaskPanelDeclined from "./ActionTaskPanelDeclined";

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error(error);
  let errorText: string | undefined = undefined;
  if (isRouteErrorResponse(error)) {
    errorText = error.statusText;
  } else if (error instanceof Error) {
    errorText = error.name;
  }
  return (
    <Card>
      <p className="text-red-500 text-center">
        Error loading task: {errorText}
      </p>
    </Card>
  );
}

export interface TaskPanelContext
  extends Omit<ActionTaskPanelProps, "action" | "userRelation"> {
  userRelation: UserActionRelation | null;
}

const ActionPageTaskPanel = () => {
  const { userRelation, ...panelHandlers } =
    useOutletContext<TaskPanelContext>();
  const action = useActionLoaderData();

  if (!userRelation) {
    return null;
  }

  console.log("userRelation", userRelation);

  if (userRelation === "completed") {
    return <ActionTaskPanelCompleted />;
  }

  if (userRelation === "declined") {
    return <ActionTaskPanelDeclined />;
  }

  return (
    <ActionTaskPanel
      action={action}
      userRelation={userRelation}
      {...panelHandlers}
    />
  );
};

export default ActionPageTaskPanel;
