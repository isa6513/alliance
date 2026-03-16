import {
  ActionDto,
  UserActionRelation,
} from "@alliance/shared/client/types.gen";
import {
  ActionPageTaskPanelState,
  getActionPageTaskPanelState,
} from "@alliance/shared/lib/actionPageTaskPanel";
import ActionTaskPanel from "./ActionTaskPanel";
import Card, { CardStyle } from "./system/Card";
import Text from "./system/Text";
import {
  externalOnly,
  taskDeadlinePassed,
  taskDeadlinePassedDescription,
  taskNotAssigned,
} from "@alliance/shared/lib/copy";
import ActionTaskPanelDeclined from "./ActionTaskPanelDeclined";
import ActionTaskPanelCompleted from "./ActionTaskPanelCompleted";
import { View } from "react-native";
import { useAuth } from "../lib/AuthContext";
import { Link } from "expo-router";

export interface ActionPageTaskPanelProps {
  action: ActionDto;
  userRelation: UserActionRelation | null;
  onCompleteAction: () => void;
  onJoinAction: () => void;
  onDeclineAction: () => void;
  onOptOutAction: () => void;
  scrollPageTo: (y: number) => void;
  scrollToEnd?: (animated?: boolean) => void;
}

const ActionPageTaskPanel = ({
  action,
  userRelation,
  onCompleteAction,
  onJoinAction,
  onDeclineAction,
  onOptOutAction,
  scrollPageTo,
  scrollToEnd,
}: ActionPageTaskPanelProps) => {
  const { user } = useAuth();
  const state = getActionPageTaskPanelState(action, userRelation, user?.hasActiveContract ?? false);

  const panelHandlers = {
    onCompleteAction,
    onJoinAction,
    onDeclineAction,
    onOptOutAction,
  };

  switch (state) {
    case ActionPageTaskPanelState.PublicOnly:
      //TODO: should always be authenticated in app
      return (
        <Card cardStyle={CardStyle.Grey}>
          <Text>{externalOnly}</Text>
        </Card>
      );
    case ActionPageTaskPanelState.NotAuthenticated:
      return (
        //TODO: should always be authenticated in app
        <Card cardStyle={CardStyle.Grey}>
          <Text>Error authenticating user - please try again.</Text>
        </Card>
      );
    case ActionPageTaskPanelState.NotAssigned:
      return <Card cardStyle={CardStyle.Grey}><Text>{taskNotAssigned}</Text></Card>;
    case ActionPageTaskPanelState.MissingDataOrNotActive:
      return null;
    case ActionPageTaskPanelState.Completed:
      return <ActionTaskPanelCompleted action={action} />;
    case ActionPageTaskPanelState.Declined:
      return <ActionTaskPanelDeclined />;
    case ActionPageTaskPanelState.MemberActionClosed:
      return null;
    case ActionPageTaskPanelState.ShowTaskWithMissedDeadline:
      return (
        <View>
          <Card cardStyle={CardStyle.Grey} className="bg-zinc-100 my-2">
            <Text className="font-medium">{taskDeadlinePassed}</Text>
            <Text>{taskDeadlinePassedDescription}</Text>
          </Card>
          <ActionTaskPanel
            action={action}
            userRelation={userRelation ?? "none"}
            scrollPageTo={scrollPageTo}
            scrollToEnd={scrollToEnd}
            {...panelHandlers}
          />
        </View>
      );
    case ActionPageTaskPanelState.OnboardingSignContractFirst:
      return (
        <View>
          <Card cardStyle={CardStyle.Grey} className="bg-zinc-100 my-2">
            <Text className="font-medium">Please sign the contract before continuing with the onboarding process.</Text>
            <Link href="/" className="text-green flex items-center gap-x-2">Go back</Link>
          </Card>
          <ActionTaskPanel
            action={action}
            userRelation={userRelation ?? "none"}
            scrollPageTo={scrollPageTo}
            scrollToEnd={scrollToEnd}
            {...panelHandlers}
            disabled
          />
        </View>
      );
    case ActionPageTaskPanelState.ShowTask:
      return (
        <ActionTaskPanel
          action={action}
          scrollPageTo={scrollPageTo}
          scrollToEnd={scrollToEnd}
          userRelation={userRelation ?? "none"}
          {...panelHandlers}
        />
      );
    default:
      throw new Error(
        `Unknown action page task panel state: ${state satisfies never}`
      );
  }
};

export default ActionPageTaskPanel;
