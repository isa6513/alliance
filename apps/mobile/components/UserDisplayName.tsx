import { cn } from "@alliance/shared/styles/util";
import { Earth, UserCircle } from "lucide-react-native";
import { View } from "react-native";
import { colors } from "../lib/style/colors";
import ClusterTag, { ClusterTagInfo } from "./ClusterTag";
import Text, { FontWeight } from "./system/Text";

interface UserDisplayNameProps {
  name: string;
  staff?: boolean;
  grouplead?: boolean;
  expert?: boolean;
  expertLabel?: string;
  cluster?: ClusterTagInfo | null;
  sameClusterAsViewer?: boolean;
  small?: boolean;
  className?: string;
  nameClassName?: string;
}

const UserDisplayName: React.FC<UserDisplayNameProps> = ({
  name,
  staff = false,
  grouplead = false,
  expert = false,
  expertLabel,
  cluster,
  sameClusterAsViewer = false,
  small = false,
  className,
  nameClassName,
}) => {
  const nameTextClass = small ? "text-xs" : "text-sm";
  const iconSize = small ? 12 : 14;
  return (
    <View className={cn("flex-row items-center gap-x-1", className)}>
      <Text
        className={cn("text-zinc-700", nameTextClass, nameClassName)}
        weight={FontWeight.Medium}
      >
        {name}
      </Text>
      {staff && (
        <Earth size={iconSize} color={colors.green} strokeWidth={1.8} />
      )}
      {!staff && grouplead && (
        <UserCircle size={iconSize} color={colors.grouplead} strokeWidth={2} />
      )}
      {expert && (
        <View className="bg-orange-500 rounded-xs px-1.5 py-0.5">
          <Text className="text-white text-xs" weight={FontWeight.Medium}>
            {expertLabel || "Expert"}
          </Text>
        </View>
      )}
      {cluster && (
        <ClusterTag
          name={cluster.displayName}
          sameAsViewer={sameClusterAsViewer}
        />
      )}
    </View>
  );
};

export default UserDisplayName;
