import { useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ActionActivityDto } from "@alliance/shared/client";
import { formatTime } from "@alliance/shared/lib/utils";
import { MessageCircleIcon } from "lucide-react-native";
import ProfileImage from "./ProfileImage";
import LikeButton from "./LikeButton";
import Comments from "./Comments";
import EditableContentRenderer from "./EditableContentRenderer";
import OutputRenderer from "./OutputRenderer";
import Text from "./system/Text";
import {
  actionActivityCommentable,
  actionActivityTransitiveVerb,
} from "@alliance/shared/lib/actionActivityConstants";

interface UserActivityCardProps {
  activity: ActionActivityDto;
  handleLike: (activityId: number) => void;
}

export default function UserActivityCard({
  activity,
  handleLike,
}: UserActivityCardProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);

  const verb = actionActivityTransitiveVerb[activity.type];
  const commentable = actionActivityCommentable[activity.type];

  const handleActionPress = useCallback(() => {
    router.push(`/actions/${activity.actionId}`);
  }, [activity.actionId]);

  const handleActivityPress = useCallback(() => {
    if (showCommentForm) return;
    router.push(`/actions/${activity.actionId}/activity/${activity.id}`);
  }, [activity.actionId, activity.id, showCommentForm]);

  const handleUserPress = useCallback(() => {
    router.push(`/member/${activity.user.id}`);
  }, [activity.user.id]);

  const timeSinceCompleted = formatTime(new Date(activity.createdAt), {
    addSuffix: true,
  });

  return (
    <View className="bg-white p-4">
      <TouchableOpacity
        activeOpacity={showCommentForm ? 1 : 0.7}
        onPress={handleActivityPress}
        disabled={showCommentForm}
      >
        {/* Header: User info and action */}
        <View className="flex-row items-start flex-wrap">
          <TouchableOpacity onPress={handleUserPress} activeOpacity={0.7}>
            <ProfileImage pfp={activity.user.profilePicture} size="medium" />
          </TouchableOpacity>
          <View className="flex flex-col gap-y-1 flex-1 ml-2">
            <Text className="text-zinc-900">
              <Text className="font-medium" onPress={handleUserPress}>
                {activity.user.displayName}
              </Text>
              <Text>{` ${verb} `}</Text>
              <Text
                className="text-green font-medium"
                onPress={handleActionPress}
              >
                {activity.actionName || "this action"}
              </Text>
            </Text>
            <Text className="text-zinc-500 text-xs">{timeSinceCompleted}</Text>
          </View>
        </View>

        {activity.formResponseOutput &&
          Object.keys(activity.formResponseOutput.publicAnswers ?? {}).length >
            0 && (
            <View className="my-3">
              <OutputRenderer submission={activity.formResponseOutput} />
            </View>
          )}

        {(!!activity.editableContent?.body ||
          (activity.editableContent?.attachments?.length ?? 0) > 0) && (
          <View className="mt-3">
            <EditableContentRenderer content={activity.editableContent} />
          </View>
        )}

        {/* Footer: pressable icons */}
        <View className="flex-row justify-between items-center mt-3">
          <View className="flex-1 flex-row items-center justify-around gap-x-8! w-full">
            <LikeButton
              liked={activity.likedByMe ?? false}
              likes={activity.likesCount}
              iconColor="#a1a1aa"
              size={22}
              onPress={() => handleLike(activity.id)}
            />

            {commentable && (
              <TouchableOpacity
                onPress={(e) => {
                  setShowCommentForm(true);
                  e.stopPropagation();
                }}
                activeOpacity={0.4}
                className="flex-row items-center gap-x-1 py-1!"
              >
                <MessageCircleIcon size={22} color="#a1a1aa" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {commentable && (
        <View className="mx-8 mt-3">
          <Comments
            objectId={activity.id}
            type="activity"
            initialComments={activity.comments}
            compact
            showForm={showCommentForm}
            autofocus={showCommentForm}
            small
          />
        </View>
      )}
    </View>
  );
}
