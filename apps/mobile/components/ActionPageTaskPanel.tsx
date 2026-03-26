import {
  ActionDto,
  UserActionRelation,
} from "@alliance/shared/client/types.gen";
import {
  ActionPageTaskPanelState,
  cardStylesForState,
  getActionPageTaskPanelState,
  shouldLoadCompletedTaskFormByState,
} from "@alliance/shared/lib/actionPageTaskPanel";
import { useCompletedTaskForm } from "@alliance/shared/lib/actionTaskPanelCompleted";
import { taskHeaders } from "@alliance/shared/lib/copy";
import { ArrowRight } from "lucide-react-native";
import { Link } from "expo-router";
import { ReactNode } from "react";
import { View } from "react-native";
import { colors } from "../lib/style/colors";
import CheckIcon from "./system/CheckIcon";
import StackedCard from "./system/StackedCard";
import Text, { FontWeight } from "./system/Text";
import ActionTaskPanel from "./ActionTaskPanel";
import { useAuth } from "../lib/AuthContext";

export interface ActionPageTaskPanelProps {
  action: ActionDto;
  userRelation: UserActionRelation | null;
  onCompleteAction: () => void;
  onJoinAction: () => void;
  onDeclineAction: () => void;
  onOptOutAction: () => void;
  scrollPageTo: (y: number, animated?: boolean) => void;
  scrollToEnd: (animated?: boolean) => void;
}

const taskPanelTopByState: Record<ActionPageTaskPanelState, ReactNode> = {
  [ActionPageTaskPanelState.PublicOnlyAuthenticated]: (
    <Text>{taskHeaders.actionPage.externalOnly}</Text>
  ),
  [ActionPageTaskPanelState.PublicOnly]: null,
  [ActionPageTaskPanelState.NotAuthenticated]: (
    <View className="flex-row flex-wrap items-center">
      <Link href="/auth/login">
        <Text className="text-green">Log in</Text>
      </Link>
      <Text> to complete this task.</Text>
    </View>
  ),
  [ActionPageTaskPanelState.NotAssigned]: (
    <Text>{taskHeaders.actionPage.notAssigned}</Text>
  ),
  [ActionPageTaskPanelState.Completed]: (
    <View className="flex-row items-center gap-x-3">
      <CheckIcon size="small" />
      <Text>{taskHeaders.actionPage.completed}</Text>
    </View>
  ),
  [ActionPageTaskPanelState.Declined]: (
    <Text>{taskHeaders.actionPage.withdrew}</Text>
  ),
  [ActionPageTaskPanelState.MemberActionClosed]: (
    <Text>{taskHeaders.actionPage.memberActionClosed}</Text>
  ),
  [ActionPageTaskPanelState.MissingDataOrNotActive]: null,
  [ActionPageTaskPanelState.ShowTaskWithMissedDeadline]: (
    <View className="gap-y-1">
      <Text weight={FontWeight.Medium}>
        {taskHeaders.actionPage.deadlinePassed.title}
      </Text>
      <Text className="text-zinc-500">
        {taskHeaders.actionPage.deadlinePassed.description}
      </Text>
    </View>
  ),
  [ActionPageTaskPanelState.OnboardingSignContractFirst]: (
    <View className="flex-row items-center justify-between gap-x-2">
      <Text className="flex-1">
        {taskHeaders.actionPage.onboardingSignContractFirst}
      </Text>
      <Link href="/actions" className="flex-row items-center gap-x-2">
        <Text className="text-green">Go back</Text>
        <ArrowRight size={16} color={colors.green} />
      </Link>
    </View>
  ),
  [ActionPageTaskPanelState.Optional]: (
    <View className="gap-y-1">
      <Text className="text-sky-500" weight={FontWeight.Medium}>
        {taskHeaders.actionPage.optional.title}
      </Text>
      <Text className="text-zinc-500">
        {taskHeaders.actionPage.optional.description}
      </Text>
    </View>
  ),
  [ActionPageTaskPanelState.ShowTask]: null,
};

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
  const { user, isAuthenticated } = useAuth();
  const state = getActionPageTaskPanelState({
    action,
    userRelation,
    contractSigned: user?.hasActiveContract ?? false,
    isAuthenticated,
  });
  const formResponse = useCompletedTaskForm(
    action,
    shouldLoadCompletedTaskFormByState[state],
  );
  const taskPanelHeader = taskPanelTopByState[state];
  const { header: headerStyle, body: bodyStyle } = cardStylesForState(state);

  const panelHandlers = {
    onCompleteAction,
    onJoinAction,
    onDeclineAction,
    onOptOutAction,
  };

  switch (state) {
    case ActionPageTaskPanelState.Declined:
    case ActionPageTaskPanelState.Completed:
    case ActionPageTaskPanelState.PublicOnlyAuthenticated:
    case ActionPageTaskPanelState.NotAuthenticated:
    case ActionPageTaskPanelState.NotAssigned:
    case ActionPageTaskPanelState.MemberActionClosed:
    case ActionPageTaskPanelState.OnboardingSignContractFirst:
      return (
        <StackedCard
          top={taskPanelHeader}
          topCardStyle={headerStyle}
          bottom={
            <ActionTaskPanel
              action={action}
              scrollPageTo={scrollPageTo}
              scrollToEnd={scrollToEnd}
              disabled
              formResponse={formResponse ?? undefined}
              {...panelHandlers}
            />
          }
          bottomCardStyle={bodyStyle}
        />
      );
    case ActionPageTaskPanelState.PublicOnly:
    case ActionPageTaskPanelState.ShowTaskWithMissedDeadline:
    case ActionPageTaskPanelState.Optional:
    case ActionPageTaskPanelState.ShowTask:
      return (
        <StackedCard
          top={taskPanelHeader}
          topCardStyle={headerStyle}
          bottom={
            <ActionTaskPanel
              action={action}
              scrollPageTo={scrollPageTo}
              scrollToEnd={scrollToEnd}
              {...panelHandlers}
            />
          }
          bottomCardStyle={bodyStyle}
        />
      );
    case ActionPageTaskPanelState.MissingDataOrNotActive:
      return null;
    default:
      throw new Error(
        `Unknown action page task panel state: ${state satisfies never}`,
      );
  }
};

export default ActionPageTaskPanel;
