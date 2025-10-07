import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import { usePostsData } from "../../applayout";
import ForumListPost from "../../components/ForumListPost";
import { useGrayBackground } from "../../components/HtmlBackgroundManager";
import List from "@alliance/shared/ui/List";
import CenterLayout from "@alliance/shared/ui/CenterLayout";
import Card, { CardStyle } from "@alliance/shared/ui/Card";

const ForumPage: React.FC = () => {
  const posts = usePostsData();

  const navigate = useNavigate();

  const handleCreatePost = useCallback(() => {
    navigate("/forum/edit/new");
  }, [navigate]);

  const sorted = posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  useGrayBackground();

  return (
    <CenterLayout className="space-y-3">
      <Card
        onClick={handleCreatePost}
        style={CardStyle.Outline}
        className="text-zinc-500"
      >
        Create a new thread...
      </Card>
      <List className="mb-10">
        {sorted.map((post) => (
          <ForumListPost key={post.id} post={post} />
        ))}
      </List>
    </CenterLayout>
  );
};

export default ForumPage;
