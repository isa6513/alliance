import { ActionActivityDto } from "@alliance/shared/client";

export interface FormattedActionActivityMessageProps {
  activity: ActionActivityDto;
  showAction?: boolean;
}

const FormattedActionActivityMessage = ({
  activity,
  showAction = false,
}: FormattedActionActivityMessageProps) => {
  const userName = activity.user.displayName || "Someone";

  switch (activity.type) {
    case "user_joined":
      return showAction ? (
        <span>
          {userName} committed to{" "}
          <span className="text-green">{activity.actionName}</span>
        </span>
      ) : (
        <span>{userName} committed to this action</span>
      );
    case "user_completed":
      return showAction ? (
        <span>
          {userName} completed{" "}
          <span className="text-green">{activity.actionName}</span>
        </span>
      ) : (
        <span>{userName} completed this action</span>
      );
    default:
      return <span>Unknown activity</span>;
  }
};

export default FormattedActionActivityMessage;
