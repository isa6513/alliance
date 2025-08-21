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
        <p>
          {userName} committed to{" "}
          <span className="text-green">{activity.actionName}</span>
        </p>
      ) : (
        <p>{userName} committed to this action</p>
      );
    case "user_completed":
      return showAction ? (
        <p>
          {userName} completed{" "}
          <span className="text-green">{activity.actionName}</span>
        </p>
      ) : (
        <p>{userName} completed this action</p>
      );
    default:
      return <p>Unknown activity</p>;
  }
};

export default FormattedActionActivityMessage;
