import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  PostDto,
  ReplyDto,
  forumFindOnePost,
  forumCreateReply,
  forumUpdateReply,
  forumDeleteReply,
} from "../../../../../../shared/client";
import {
  Card,
  Button,
  Badge,
  Input,
  colors,
  CardStyle,
  ButtonColor,
  BadgeColor,
} from "../../../../components/system";
import { useAuth } from "../../../../lib/AuthContext";

interface ReplyWithDepth extends ReplyDto {
  depth: number;
  children?: ReplyWithDepth[];
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [editingReply, setEditingReply] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchPost = useCallback(async () => {
    if (!id) return;

    try {
      const response = await forumFindOnePost({
        path: {
          id,
        },
      });
      if (response.error || !response.data) {
        throw new Error("Failed to fetch post");
      }

      setPost(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load post");
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPost();
    setRefreshing(false);
  };

  const handleReply = async () => {
    if (!post || !replyContent.trim() || !user) return;

    setSubmittingReply(true);
    try {
      const response = await forumCreateReply({
        body: {
          content: replyContent.trim(),
          postId: post.id,
          parentId: replyingTo || undefined,
        },
      });

      if (response.error) {
        throw new Error("Failed to create reply");
      }

      setReplyContent("");
      setReplyingTo(null);
      await fetchPost();
    } catch (err) {
      Alert.alert("Error", "Failed to submit reply");
      console.error("Error creating reply:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditReply = async (replyId: number) => {
    if (!editContent.trim()) return;

    try {
      const response = await forumUpdateReply({
        body: {
          content: editContent.trim(),
        },
        path: {
          id: replyId.toString(),
        },
      });

      if (response.error) {
        throw new Error("Failed to update reply");
      }

      setEditingReply(null);
      setEditContent("");
      await fetchPost();
    } catch (err) {
      Alert.alert("Error", "Failed to update reply");
      console.error("Error updating reply:", err);
    }
  };

  const confirmDeleteReply = (replyId: number) => {
    Alert.alert("Delete Reply", "Are you sure you want to delete this reply?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteReply(replyId),
      },
    ]);
  };

  const handleDeleteReply = async (replyId: number) => {
    try {
      const response = await forumDeleteReply({
        path: {
          id: replyId.toString(),
        },
      });
      if (response.error) {
        throw new Error("Failed to delete reply");
      }
      await fetchPost();
    } catch (err) {
      Alert.alert("Error", "Failed to delete reply");
      console.error("Error deleting reply:", err);
    }
  };

  const startReply = (parentId: number | null) => {
    setReplyingTo(parentId);
    setReplyContent("");
  };

  const startEdit = (reply: ReplyDto) => {
    setEditingReply(reply.id);
    setEditContent(reply.content);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const buildReplyTree = (
    replies: ReplyDto[],
    depth: number = 0
  ): ReplyWithDepth[] => {
    return replies.map((reply) => ({
      ...reply,
      depth,
      children: reply.children
        ? buildReplyTree(reply.children, depth + 1)
        : undefined,
    }));
  };

  const renderReply = (reply: ReplyWithDepth) => {
    const isEditing = editingReply === reply.id;
    const isAuthor = user?.id === reply.author.id;
    const maxDepth = 10;

    return (
      <View key={reply.id}>
        <View
          style={[
            styles.replyContainer,
            { marginLeft: Math.min(reply.depth * 16, maxDepth * 16) },
          ]}
        >
          <View style={styles.replyHeader}>
            <Text style={styles.replyAuthor}>{reply.author.name}</Text>
            <Text style={styles.replyDate}>{formatDate(reply.createdAt)}</Text>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <Input
                value={editContent}
                onChangeText={setEditContent}
                multiline
                style={styles.editInput}
              />
              <View style={styles.editButtons}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setEditingReply(null);
                    setEditContent("");
                  }}
                  color={ButtonColor.Light}
                  style={styles.editButton}
                />
                <Button
                  title="Save"
                  onPress={() => handleEditReply(reply.id)}
                  color={ButtonColor.Green}
                  style={styles.editButton}
                />
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.replyContent}>{reply.content}</Text>
              <View style={styles.replyActions}>
                {user && (
                  <TouchableOpacity
                    style={styles.replyActionButton}
                    onPress={() => startReply(reply.id)}
                  >
                    <Text style={styles.replyActionText}>Reply</Text>
                  </TouchableOpacity>
                )}
                {isAuthor && (
                  <>
                    <TouchableOpacity
                      style={styles.replyActionButton}
                      onPress={() => startEdit(reply)}
                    >
                      <Text style={styles.replyActionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.replyActionButton, styles.deleteButton]}
                      onPress={() => confirmDeleteReply(reply.id)}
                    >
                      <Text style={[styles.replyActionText, styles.deleteText]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </View>

        {/* Inline reply form */}
        {replyingTo === reply.id && (
          <View style={styles.inlineReplyForm}>
            <Input
              value={replyContent}
              onChangeText={setReplyContent}
              placeholder="Write a reply..."
              multiline
              style={styles.inlineReplyInput}
              autoFocus
            />
            <View style={styles.inlineReplyActions}>
              <TouchableOpacity
                style={styles.inlineReplyButton}
                onPress={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
              >
                <Text style={styles.inlineReplyButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.inlineReplyButton, styles.inlineReplySubmit]}
                onPress={handleReply}
                disabled={!replyContent.trim() || submittingReply}
              >
                <Text
                  style={[
                    styles.inlineReplyButtonText,
                    styles.inlineReplySubmitText,
                  ]}
                >
                  {submittingReply ? "Submitting..." : "Reply"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {reply.children?.map((child) => renderReply(child))}

        {/* Horizontal separator */}
        <View style={styles.replySeparator} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "Post not found"}</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          color={ButtonColor.Blue}
        />
      </View>
    );
  }

  const replyTree = buildReplyTree(post.replies || []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={() => router.back()}
          color={ButtonColor.Light}
          style={styles.backButton}
        />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card cardStyle={CardStyle.White} style={styles.postCard}>
          <View style={styles.postHeader}>
            <Text style={styles.postTitle}>{post.title}</Text>
            {post.action && (
              <Badge
                text={post.action.category}
                color={BadgeColor.Green}
                style={styles.actionBadge}
              />
            )}
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.postFooter}>
            <Text style={styles.postAuthor}>By {post.author.name}</Text>
            <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
          </View>
        </Card>

        {user && !replyingTo && (
          <Card cardStyle={CardStyle.Grey} style={styles.replyForm}>
            <Input
              value={replyContent}
              onChangeText={setReplyContent}
              placeholder="Write a comment..."
              multiline
              style={styles.replyInput}
            />
            <View style={styles.replyFormActions}>
              <Button
                title={submittingReply ? "Submitting..." : "Submit"}
                onPress={handleReply}
                color={ButtonColor.Green}
                disabled={!replyContent.trim() || submittingReply}
                style={styles.replyFormButton}
              />
            </View>
          </Card>
        )}

        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>
            Replies ({post.replies?.length || 0})
          </Text>
          {replyTree.map((reply) => renderReply(reply))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.page,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.page,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
  },
  postCard: {
    marginTop: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    flex: 1,
    lineHeight: 26,
  },
  actionBadge: {
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  postDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  replyForm: {
    marginBottom: 16,
  },
  replyInput: {
    minHeight: 80,
    marginBottom: 12,
  },
  replyFormActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  },
  replyFormButton: {
    paddingHorizontal: 16,
    minHeight: 36,
  },
  repliesSection: {
    marginBottom: 24,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 16,
  },
  replyContainer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  replyDate: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  replyContent: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  replyActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  replyActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  replyActionText: {
    fontSize: 12,
    color: colors.blue,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "transparent",
  },
  deleteText: {
    color: colors.error,
  },
  replySeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  inlineReplyForm: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 16,
    padding: 12,
    backgroundColor: colors.card.grey,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
  },
  inlineReplyInput: {
    minHeight: 60,
    marginBottom: 8,
  },
  inlineReplyActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  inlineReplyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  inlineReplyButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  inlineReplySubmit: {
    backgroundColor: colors.button.green,
    borderRadius: 6,
  },
  inlineReplySubmitText: {
    color: "#fff",
  },
  editForm: {
    gap: 12,
  },
  editInput: {
    minHeight: 60,
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
  },
});
