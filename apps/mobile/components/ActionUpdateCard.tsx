import { View } from "react-native";
import { formatDistance } from "date-fns";
import Markdown from "react-native-markdown-display";
import { ActionUpdateDto } from "@alliance/shared/client";
import Text from "./system/Text";

export interface ActionUpdateCardProps {
  update: ActionUpdateDto;
}

export default function ActionUpdateCard({ update }: ActionUpdateCardProps) {
  return (
    <View className="flex flex-col border border-zinc-200 rounded-sm overflow-hidden">
      <View className="p-3 bg-zinc-50 border-b border-zinc-200">
        <View className="flex flex-col">
          <View className="flex flex-row flex-wrap items-center gap-x-2">
            <Text>
              <Text className="text-green font-medium">Update: </Text>
              <Text className="font-medium">{update.title}</Text>
            </Text>
            <Text className="text-zinc-500">
              {formatDistance(new Date(update.date), new Date(), {
                addSuffix: true,
              })}
            </Text>
          </View>
        </View>
      </View>
      {!!update.content?.body && (
        <View className="p-3 bg-white">
          <Markdown
            style={{
              body: {
                fontFamily: "SourceSans3",
                fontSize: 14,
                lineHeight: 20,
                color: "#333",
              },
              paragraph: {
                marginBottom: 8,
                marginTop: 0,
              },
            }}
          >
            {update.content.body}
          </Markdown>
        </View>
      )}
    </View>
  );
}
