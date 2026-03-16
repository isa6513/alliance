import React, { useMemo } from "react";
import { Image, View } from "react-native";
import { EditableContentDto } from "@alliance/shared/client";
import Text from "./system/Text";
import AppMarkdownWrapper from "./AppMarkdownWrapper";
import { cn } from "@alliance/shared/styles/util";

interface EditableContentRendererProps {
  content: EditableContentDto;
  collapsed?: boolean;
  deleted?: boolean;
  className?: string;
  truncated?: boolean;
}

const EditableContentRenderer: React.FC<EditableContentRendererProps> = ({
  content,
  collapsed = false,
  deleted = false,
  className,
  truncated = false,
}) => {
  const attachments = useMemo(
    () =>
      (content.attachments ?? []).filter((src): src is string => Boolean(src)),
    [content.attachments]
  );
  const body = content?.body ?? "";

  if (deleted) {
    return (
      <View className={className}>
        <Text className="text-sm text-zinc-400">Content has been deleted</Text>
      </View>
    );
  }

  const renderBody = () => {
    if (!body) return null;
    if (collapsed) {
      return (
        <Text className="text-zinc-800" numberOfLines={1}>
          {body}
        </Text>
      );
    }
    if (truncated) {
      return (
        <Text className="text-zinc-800" numberOfLines={3}>
          {body}
        </Text>
      );
    }
    return <AppMarkdownWrapper>{body}</AppMarkdownWrapper>;
  };

  return (
    <View className={className}>
      {renderBody()}
      {attachments.length > 0 && (
        <View className={cn("flex-row flex-wrap gap-2", body && "mt-2")}>
          {attachments.map((uri, idx) => (
            <Image
              key={`${uri}-${idx}`}
              source={{ uri }}
              className="w-24 h-24 rounded"
              resizeMode="cover"
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default EditableContentRenderer;
