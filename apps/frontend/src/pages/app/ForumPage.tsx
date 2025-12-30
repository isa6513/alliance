import React, { useCallback } from "react";
import { href, useNavigate, useOutletContext } from "react-router";
import ForumListPost from "../../components/ForumListPost";
import { useGrayBackground } from "../../components/HtmlBackgroundManager";
import List from "@alliance/sharedweb/ui/List";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import { AppLayoutOutletContext } from "../../applayout";

const ForumPage: React.FC = () => {
  const { posts } = useOutletContext<AppLayoutOutletContext>();

  const navigate = useNavigate();

  const handleCreatePost = useCallback(() => {
    navigate(href("/forum/edit/:postId", { postId: "new" }));
  }, [navigate]);

  useGrayBackground();

  if (posts === null) {
    return null;
  }

  const sorted = posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <CenterLayout className="space-y-3">
      <Card
        onClick={handleCreatePost}
        style={CardStyle.Outline}
        className="text-zinc-500"
      >
        <p>Create a new thread...</p>
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
