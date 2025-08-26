import Card, { CardStyle } from "@alliance/shared/ui/Card";
import { useNavigate } from "react-router";
import StatusIndicator, { Status } from "./StatusIndicator";

export interface ActionPromptCardProps {
  title: string;
  description: string;
  category: string;
  id: string;
}

const ActionPromptCard: React.FC<ActionPromptCardProps> = ({
  title,
  description,
  id,
}: ActionPromptCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <StatusIndicator status={Status.New} />
      <Card
        style={CardStyle.Alert}
        className="block space-y-2 "
        onClick={() => {
          navigate(`/actions/${id}`);
        }}
      >
        <div className="flex items-center justify-start w-[100%] space-x-3">
          <p className="font-bold">Commit to a new action: {title}</p>
        </div>
        <div className="flex items-center justify-between ">
          <p>{description}</p>
        </div>
      </Card>
    </div>
  );
};

export default ActionPromptCard;
