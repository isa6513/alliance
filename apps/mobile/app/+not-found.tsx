import { Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  if (__DEV__)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Not found :(</Text>
      </View>
    );

  return <Redirect href="/" />;
}
