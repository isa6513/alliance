import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../../lib/AuthContext";
import { router } from "expo-router";
import { PostDto, forumFindAllPosts } from "../../../../../shared/client";
import {
  Card,
  Button,
  Badge,
  colors,
  CardStyle,
  ButtonColor,
  BadgeColor,
} from "../../../components/design-system";
import { FontAwesome } from "@expo/vector-icons";

export default function ForumScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const response = await forumFindAllPosts();
      if (response.error) {
        throw new Error("Failed to fetch posts");
      }
      setPosts(response.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load forum posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const navigateToPost = (postId: number) => {
    router.push(`/forum/post/${postId}`);
  };

  const navigateToCreatePost = () => {
    router.push("/forum/create");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : error ? (
          <Card cardStyle={CardStyle.Alert} style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Retry"
              onPress={fetchPosts}
              color={ButtonColor.Blue}
              style={styles.retryButton}
            />
          </Card>
        ) : posts.length === 0 ? (
          <Card cardStyle={CardStyle.Grey} style={styles.emptyCard}>
            <Text style={styles.emptyText}>No forum posts yet</Text>
            {user && (
              <Button
                title="Create First Post"
                onPress={navigateToCreatePost}
                color={ButtonColor.Green}
                style={styles.createFirstButton}
              />
            )}
          </Card>
        ) : (
          posts.map((post) => (
            <Card
              key={post.id}
              cardStyle={CardStyle.White}
              style={styles.postCard}
              onPress={() => navigateToPost(post.id)}
            >
              <View style={styles.postHeader}>
                <Text style={styles.postTitle} numberOfLines={2}>
                  {post.title}
                </Text>
                {post.action && (
                  <Badge
                    text={post.action.category}
                    color={BadgeColor.Green}
                    style={styles.actionBadge}
                  />
                )}
              </View>

              <Text style={styles.postPreview} numberOfLines={3}>
                {post.content}
              </Text>

              <View style={styles.postFooter}>
                <View style={styles.postMeta}>
                  <Text style={styles.authorName}>{post.author.name}</Text>
                  <Text style={styles.postDate}>
                    {formatDate(post.createdAt)}
                  </Text>
                </View>

                <View style={styles.postStats}>
                  <View style={styles.statItem}>
                    <FontAwesome
                      name="comment"
                      size={12}
                      color={colors.text.tertiary}
                    />
                    <Text style={styles.statText}>
                      {post.replies?.length || 0}
                    </Text>
                  </View>
                  <FontAwesome
                    name="chevron-right"
                    size={12}
                    color={colors.text.tertiary}
                  />
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {user && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={navigateToCreatePost}
          activeOpacity={0.8}
        >
          <FontAwesome name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100, // Add space for floating button
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.button.green,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loader: {
    marginTop: 40,
  },
  errorCard: {
    marginTop: 20,
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
  },
  emptyCard: {
    marginTop: 20,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  createFirstButton: {
    marginTop: 8,
  },
  postCard: {
    marginTop: 8,
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  actionBadge: {
    marginTop: 1,
  },
  postPreview: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  postMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authorName: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  postDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.card.grey,
  },
  statText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: "500",
  },
});
