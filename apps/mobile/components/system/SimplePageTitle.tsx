import { Pressable, View } from "react-native";
import { Menu } from "lucide-react-native";
import Text from "./Text";
import { useAppDrawer } from "../../lib/AppDrawerContext";
import { colors } from "../../lib/style/colors";

export const SimplePageTitle = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => {
  const { openDrawer, isPermanent } = useAppDrawer();
  return (
    <View className="flex-row items-center gap-2 px-2 justify-between border-b border-zinc-200 pb-2">
      <View className="flex-row items-center">
        {!isPermanent && (
          <Pressable onPress={openDrawer} className="p-2 px-4">
            <Menu size={24} color={colors.text.icon} strokeWidth={2.5} />
          </Pressable>
        )}
        <Text className="text-xl font-semibold text-zinc-900 font-serif">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
};
