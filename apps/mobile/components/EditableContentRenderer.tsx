import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { EditableContentDto } from "@alliance/shared/client";
import Text from "./system/Text";

interface EditableContentRendererProps {
  content: EditableContentDto;
  collapsed?: boolean;
  deleted?: boolean;
  className?: string;
  truncated?: boolean;
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 20,
    color: "#000",
  },
  link: {
    color: "#62a124",
  },
});

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
        <Text className="text-sm text-zinc-800" numberOfLines={1}>
          {body}
        </Text>
      );
    }
    if (truncated) {
      return (
        <Text className="text-sm text-zinc-800" numberOfLines={3}>
          {body}
        </Text>
      );
    }
    return <Markdown style={markdownStyles}>{body}</Markdown>;
  };

  return (
    <View className={className}>
      {renderBody()}
      {attachments.length > 0 && (
        <View className={`flex-row flex-wrap gap-2 ${body ? "mt-2" : ""}`}>
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
