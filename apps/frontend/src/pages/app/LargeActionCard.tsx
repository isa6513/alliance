import type { FormSchema } from "@alliance/common/forms/form-schema";
import { useCallback, useEffect, useState, type RefObject } from "react";
import { href, Link, useNavigate } from "react-router";
import { cn } from "@alliance/shared/styles/util";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import ActionTaskPanel from "../../components/ActionTaskPanel";
import ActionCompletedBarWithInfo from "./ActionCompletedBarWithInfo";
import TaskTimeInfo from "./TaskTimeInfo";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { taskHeaders } from "@alliance/shared/lib/copy";
import {
  getNextEvent,
  LargeActionCardPropsShared,
} from "@alliance/shared/lib/largeActionCard";
import { CardStyle } from "@alliance/shared/styles/card";
import Card from "@alliance/sharedweb/ui/Card";
import useActivities, {
  ActivityList,
} from "@alliance/shared/lib/useActivities";
import { UserActionRelation } from "@alliance/shared/client";

export interface LargeActionCardProps extends LargeActionCardPropsShared {
  showDetails?: boolean;
  className?: string;
  onCompleteAction: () => void;
  userRelation: UserActionRelation;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  staticTaskFormSchema?: FormSchema;
}

enum LargeActionCardState {
  Minified = "minified",
  Default = "default",
  Confirming = "confirming",
  Completed = "completed",
  Committed = "committed",
  Closed = "closed",
  Declined = "declined",
}

const LargeActionCard: React.FC<LargeActionCardProps> = ({
  action,
  dismissProps,
  userRelation,
  onUpdateActionState,
  onCompleteAction,
  showDetails = true,
  className = "",
  scrollContainerRef,
  staticTaskFormSchema,
}: LargeActionCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const contractSigned = user?.hasActiveContract ?? false;
  const mustSignContractFirst =
    action.onboarding && !contractSigned && !action.isContractSigningAction;

  const [state, setState] = useState<LargeActionCardState>(
    LargeActionCardState.Default,
  );

  const { activities: friendActivities } = useActivities({
    list: ActivityList.FriendsForAction,
    objectId: action.id,
    comments: false,
    limit: 8,
  });

  useEffect(() => {
    setState(LargeActionCardState.Default);
  }, [action]);

  const handleUpdateActionState = useCallback(() => {
    setState(LargeActionCardState.Closed);
    setTimeout(() => {
      onUpdateActionState();
    }, 200);
  }, [onUpdateActionState]);

  const handleCompleteAction = useCallback(() => {
    onCompleteAction();
    handleUpdateActionState();
  }, [onCompleteAction, handleUpdateActionState]);

  const goToActionPage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(
        href("/actions/:id", { id: action.id.toString() }) + "#description",
      );
    },
    [navigate, action],
  );

  const nextEvent = getNextEvent(action);

  return (
    <>
      <Card
        className={cn(
          "p-4 sm:p-6 transition-all duration-300 w-full relative rounded-md",
          state === LargeActionCardState.Closed && "opacity-0 overflow-hidden",
          state === LargeActionCardState.Minified && "pb-4",
          state !== LargeActionCardState.Closed && "opacity-100",
          className,
        )}
      >
        {dismissProps && (
          <Card style={CardStyle.Alert} className="mb-3 border-none rounded-md">
            <p className="font-semibold">{dismissProps.header}</p>
            <p className="mb-3">{dismissProps.message}</p>
            <Button
              color={ButtonColor.WhiteBorderless}
              onClick={dismissProps.onDismiss}
              className="w-full"
            >
              Dismiss
            </Button>
          </Card>
        )}
        <div className="p-0 sm:p-2">
          <div className="flex sm:flex-row gap-4 items-start flex-col-reverse">
            <div className="flex flex-col flex-1 gap-y-2">
              <p className="text-title text-2xl!">{action.name}</p>
              <TaskTimeInfo action={action} nextEvent={nextEvent} />
            </div>
            {showDetails && (
              <Button
                color={ButtonColor.Grey}
                onClick={goToActionPage}
                className="!px-4 flex gap-x-1 text-sm font-normal"
              >
                Details
                <ChevronRight size="15" className="-mr-1" />
              </Button>
            )}
          </div>
          <p className="my-4">{action.shortDescription}</p>
          <ActionCompletedBarWithInfo
            friendActivities={friendActivities}
            action={action}
            textSize="base"
          />
          <div className="mt-6 border-t border-zinc-200 pt-6">
            {mustSignContractFirst && (
              <div className="mb-4 flex flex-row justify-between items-center gap-x-2 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <p>{taskHeaders.actionPage.onboardingSignContractFirst}</p>
                <Link
                  to="/tasks"
                  className="text-green flex items-center gap-x-2 shrink-0"
                >
                  Go back
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
            <ActionTaskPanel
              action={action}
              userRelation={userRelation}
              onCompleteAction={handleCompleteAction}
              onOptOutAction={handleUpdateActionState}
              scrollContainerRef={scrollContainerRef}
              disabled={mustSignContractFirst}
              staticTaskFormSchema={staticTaskFormSchema}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default LargeActionCard;
