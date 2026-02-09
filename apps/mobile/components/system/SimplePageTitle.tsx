import { View } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Menu } from "lucide-react-native";
import Text from "./Text";

export const SimplePageTitle = ({ title }: { title: string }) => {

    const navigation = useNavigation();
    return (
        <View className="flex-row items-center gap-2 pt-14 pb-4">
            <Menu size={24} color="#71717a" strokeWidth={2.5} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
            <Text className="text-xl font-semibold text-zinc-900 font-serif">
                {title}
            </Text>
        </View>
    );
};