import { View } from "react-native";
import { formatDistance } from "date-fns";
import { ActionUpdateDto, NotificationDto } from "@alliance/shared/client";
import Text from "./system/Text";
import EditableContentRenderer from "./EditableContentRenderer";
import { useMarkUnreadContentRead } from "@alliance/shared/lib/useUnreadContentRead";
import { useQueryClient } from "@tanstack/react-query";

export interface ActionUpdateCardProps {
  update: ActionUpdateDto;
}

export default function ActionUpdateCard({ update }: ActionUpdateCardProps) {
  const queryClient = useQueryClient();

  useMarkUnreadContentRead({
    contentType: "action_update",
    contentIds: [update.id],
    onMarked: (contentType, contentIds) => {
      const ids = new Set(contentIds);
      const readAt = new Date().toISOString();
      queryClient.setQueryData(
        ["notifications"],
        (
          oldData:
            | {
                data?: NotificationDto[];
              }
            | undefined,
        ) => {
          if (!oldData?.data) {
            return oldData;
          }

          return {
            ...oldData,
            data: oldData.data.map((notification) => {
              if (
                notification.readAt ||
                notification.contentType !== contentType ||
                typeof notification.contentId !== "number" ||
                !ids.has(notification.contentId)
              ) {
                return notification;
              }

              return { ...notification, readAt };
            }),
          };
        },
      );
    },
  });

  const hasContent =
    !!update.content?.body || (update.content?.attachments?.length ?? 0) > 0;

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
      {hasContent && (
        <View className="p-3 bg-white">
          <EditableContentRenderer content={update.content} />
        </View>
      )}
    </View>
  );
}
