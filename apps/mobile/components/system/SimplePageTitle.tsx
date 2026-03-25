import { Pressable, View } from "react-native";
import { Menu } from "lucide-react-native";
import Text, { FontWeight } from "./Text";
import { useAppDrawer } from "../../lib/AppDrawerContext";
import { colors } from "../../lib/style/colors";

export const SimplePageTitle = ({
  title,
  children,
  isVisible = true,
}: {
  title: string;
  children?: React.ReactNode;
  isVisible?: boolean;
}) => {
  const { openDrawer, isPermanent } = useAppDrawer();
  if (!isVisible) return null;

  return (
    <View className="flex-row items-center gap-x-2 px-2 justify-between pb-2 pr-4">
      <Pressable onPress={openDrawer} className="p-2 px-2">
        <View className="flex-row items-center gap-2">
          {!isPermanent && (
            <Menu size={25} color={colors.text.icon} strokeWidth={2.5} />
          )}
          <Text className="text-2xl text-zinc-900" weight={FontWeight.Semibold}>
            {title}
          </Text>
        </View>
      </Pressable>
      {children}
    </View>
  );
};
