import { cn } from "@alliance/shared/styles/util";
import { View } from "react-native";
import Text from "./system/Text";

export interface ClusterTagInfo {
  id: number;
  displayName: string;
}

interface ClusterTagProps {
  name: string;
  sameAsViewer: boolean;
  className?: string;
}

const ClusterTag: React.FC<ClusterTagProps> = ({
  name,
  sameAsViewer,
  className,
}) => (
  <View
    className={cn(
      "rounded-xs px-1.5 py-0.5",
      sameAsViewer ? "bg-green/20" : "bg-zinc-200",
      className,
    )}
  >
    <Text
      className={cn("text-xs", sameAsViewer ? "text-green" : "text-zinc-600")}
    >
      {name}
    </Text>
  </View>
);

export default ClusterTag;
