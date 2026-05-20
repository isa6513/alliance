import { CommentDto } from "@alliance/shared/client";
import { formatTime } from "@alliance/shared/lib/utils";
import { RelativePathString, router } from "expo-router";
import { MessageCircleIcon } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import EditableContentRenderer from "./EditableContentRenderer";
import LikeButton from "./LikeButton";
import ProfileImage from "./ProfileImage";
import Text, { FontWeight } from "./system/Text";

interface ClusterForumCommentCardProps {
  comment: CommentDto;
  postId: number;
  postTitle: string;
  likedByMe: boolean;
  likesCount: number;
  handleLike: () => Promise<unknown>;
}

export default function ClusterForumCommentCard({
  comment,
  postId,
  postTitle,
  likedByMe,
  likesCount,
  handleLike,
}: ClusterForumCommentCardProps) {
  const timeSinceCommented = formatTime(new Date(comment.createdAt), {
    addSuffix: true,
  });
  const hasBody =
    !!comment.editableContent.body ||
    comment.editableContent.attachments.length > 0;
  const replyUrl =
    `/forum/post/${postId}?replyId=${comment.id}` as RelativePathString;

  return (
    <View className="bg-white p-4">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(replyUrl)}
      >
        <View className="flex-row items-start flex-wrap">
          <TouchableOpacity
            onPress={() =>
              router.push(`/member/${comment.author.id}` as RelativePathString)
            }
            activeOpacity={0.7}
          >
            <ProfileImage pfp={comment.author.profilePicture} size="medium" />
          </TouchableOpacity>
          <View className="flex flex-col gap-y-1 flex-1 ml-2">
            <Text className="text-zinc-900">
              <Text
                weight={FontWeight.Medium}
                onPress={() =>
                  router.push(
                    `/member/${comment.author.id}` as RelativePathString,
                  )
                }
              >
                {comment.author.displayName}
              </Text>
              <Text>{` commented on `}</Text>
              <Text
                className="text-green"
                weight={FontWeight.Medium}
                onPress={() =>
                  router.push(`/forum/post/${postId}` as RelativePathString)
                }
              >
                {postTitle}
              </Text>
            </Text>
            <Text className="text-zinc-500 text-xs">{timeSinceCommented}</Text>
          </View>
        </View>

        {hasBody && (
          <View className="my-3 rounded-lg bg-zinc-100 p-4">
            <EditableContentRenderer content={comment.editableContent} />
          </View>
        )}

        <View className="flex-row justify-between items-center mt-3">
          <View className="flex-1 flex-row items-center justify-around gap-x-8! w-full">
            <LikeButton
              liked={likedByMe}
              likes={likesCount}
              iconColor="#a1a1aa"
              size={22}
              onPress={handleLike}
            />
            <TouchableOpacity
              onPress={() => router.push(replyUrl)}
              activeOpacity={0.4}
              className="flex-row items-center gap-x-1 py-1!"
            >
              <MessageCircleIcon size={22} color="#a1a1aa" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
