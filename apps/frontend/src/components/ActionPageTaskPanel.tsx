import { UserActionRelation } from "@alliance/shared/client";
import Card from "@alliance/sharedweb/ui/Card";
import { Link, isRouteErrorResponse, useOutletContext } from "react-router";
import { Route } from "../../.react-router/types/src/components/+types/ActionPageTaskPanel";
import ActionTaskPanel from "./ActionTaskPanel";
import { ActionTaskPanelPropsShared } from "@alliance/shared/lib/actionTaskPanel";
import ActionTaskPanelCompleted from "./ActionTaskPanelCompleted";
import ActionTaskPanelDeclined from "./ActionTaskPanelDeclined";
import { useAuth } from "../lib/AuthContext";
import { CardStyle } from "@alliance/shared/styles/card";
import {
  ActionPageTaskPanelState,
  getActionPageTaskPanelState,
} from "@alliance/shared/lib/actionPageTaskPanel";
import {
  taskDeadlinePassed,
  taskDeadlinePassedDescription,
  taskNotAssigned,
} from "@alliance/shared/lib/copy";
import { ArrowRight } from "lucide-react";
import { cn } from "@alliance/shared/styles/util";

function ActionPageTaskPanelCardWrapper({
  taskPanelTop = null,
  taskPanel,
}: {
  taskPanelTop?: React.ReactNode;
  taskPanel: React.ReactNode;
}) {
  return (
    <div>
      {taskPanelTop && (
        <Card style={CardStyle.LightGreyBorder} className="rounded-b-none">
          {taskPanelTop}
        </Card>
      )}
      <Card
        style={CardStyle.WhiteBorder}
        className={cn("p-4 sm:p-6", taskPanelTop ? "border-t-0" : "border-t")}
      >
        {taskPanel}
      </Card>
    </div>
  );
}

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

export interface TaskPanelContext extends Omit<
  ActionTaskPanelPropsShared,
  "userRelation"
> {
  publicMode: boolean;
  userRelation: UserActionRelation | null;
}

const ActionPageTaskPanel = () => {
  const { userRelation, action, ...panelHandlers } =
    useOutletContext<TaskPanelContext>();

  const { user } = useAuth();

  const state = getActionPageTaskPanelState(
    action,
    userRelation,
    user?.hasActiveContract ?? false,
  );

  const { isAuthenticated } = useAuth();

  switch (state) {
    case ActionPageTaskPanelState.PublicOnly:
      return (
        <ActionTaskPanel
          userRelation={"none"}
          action={action}
          {...panelHandlers}
          missedDeadline={false}
          disabled={isAuthenticated}
          card={isAuthenticated}
        />
      );
    case ActionPageTaskPanelState.NotAuthenticated:
      return (
        <ActionPageTaskPanelCardWrapper
          taskPanelTop={
            <p className="text-center">
              <Link to="/login" className="text-green">
                Log in
              </Link>{" "}
              to complete this task.
            </p>
          }
          taskPanel={
            <ActionTaskPanel
              userRelation={"none"}
              action={action}
              {...panelHandlers}
              missedDeadline={false}
              disabled={true}
              card={false}
            />
          }
        />
      );
    case ActionPageTaskPanelState.NotAssigned:
      return (
        <ActionPageTaskPanelCardWrapper
          taskPanelTop={
            <p className="text-center text-zinc-500">{taskNotAssigned}</p>
          }
          taskPanel={
            <ActionTaskPanel
              userRelation={"none"}
              action={action}
              {...panelHandlers}
              missedDeadline={false}
              disabled={true}
              card={false}
            />
          }
        />
      );
    case ActionPageTaskPanelState.MissingDataOrNotActive:
      return null;
    case ActionPageTaskPanelState.Completed:
      return <ActionTaskPanelCompleted action={action} />;
    case ActionPageTaskPanelState.Declined:
      return <ActionTaskPanelDeclined />;
    case ActionPageTaskPanelState.MemberActionClosed:
      return (
        <ActionPageTaskPanelCardWrapper
          taskPanelTop={
            <p className="text-center text-zinc-500">
              This action no longer requires member participation.
            </p>
          }
          taskPanel={
            <ActionTaskPanel
              userRelation={"none"}
              action={action}
              {...panelHandlers}
              missedDeadline={false}
              disabled={true}
              card={false}
            />
          }
        />
      );
    case ActionPageTaskPanelState.ShowTaskWithMissedDeadline:
      return (
        <ActionPageTaskPanelCardWrapper
          taskPanelTop={
            <div>
              <p className="font-medium">{taskDeadlinePassed}</p>
              <p>{taskDeadlinePassedDescription}</p>
            </div>
          }
          taskPanel={
            <ActionTaskPanel
              userRelation={userRelation ?? "none"}
              action={action}
              {...panelHandlers}
              missedDeadline={true}
              card={false}
            />
          }
        />
      );
    case ActionPageTaskPanelState.OnboardingSignContractFirst:
      return (
        <ActionPageTaskPanelCardWrapper
          taskPanelTop={
            <div className="flex flex-row justify-between items-center gap-x-2">
              <p className="text-center text-zinc-500">
                Please sign the contract before continuing with the onboarding
                process.
              </p>
              <Link
                to="/tasks"
                className="text-green flex items-center gap-x-2"
              >
                Go back
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          }
          taskPanel={
            <ActionTaskPanel
              userRelation={"none"}
              action={action}
              {...panelHandlers}
              missedDeadline={false}
              disabled={true}
              card={false}
            />
          }
        />
      );
    case ActionPageTaskPanelState.ShowTask:
      return (
        <>
          {action.optional ? (
            <ActionPageTaskPanelCardWrapper
              taskPanelTop={
                <div>
                  <p className="font-medium text-sky-500">
                    This action is optional.
                  </p>
                  <p className="text-zinc-500">
                    You are not required to complete the task, but can if you
                    would like.
                  </p>
                </div>
              }
              taskPanel={
                <ActionTaskPanel
                  action={action}
                  userRelation={userRelation ?? "none"}
                  card={false}
                  {...panelHandlers}
                />
              }
            />
          ) : (
            <ActionPageTaskPanelCardWrapper
              taskPanel={
                <ActionTaskPanel
                  action={action}
                  userRelation={userRelation ?? "none"}
                  card={false}
                  {...panelHandlers}
                />
              }
            />
          )}
        </>
      );
    default:
      throw new Error(
        `Unknown action page task panel state: ${state satisfies never}`,
      );
  }
};

export default ActionPageTaskPanel;
