import { View } from "react-native";
import { Menu } from "lucide-react-native";
import Text from "./Text";
import { useAppDrawer } from "../../lib/AppDrawerContext";

export const SimplePageTitle = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => {
  const { openDrawer, isPermanent } = useAppDrawer();
  return (
    <View className="flex-row items-center gap-2 px-4 justify-between border-b border-zinc-200">
      <View className="flex-row items-center gap-2">
        {!isPermanent && (
          <Menu
            size={24}
            color="#71717a"
            strokeWidth={2.5}
            onPress={openDrawer}
          />
        )}
        <Text className="text-xl font-semibold text-zinc-900 font-serif py-4">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
};
