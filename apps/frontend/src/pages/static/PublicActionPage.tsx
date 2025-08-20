import React, { useEffect } from "react";
import Footer from "../../components/Footer";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import matter from "gray-matter";
import { useParams } from "react-router";
import MarkdownWrapper from "../../components/MarkdownWrapper";

const PublicActionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = React.useState<string>("");
  const [frontmatter, setFrontmatter] = React.useState<any>({});

  useEffect(() => {
    const getPost = async () => {
      const postFiles = import.meta.glob("/src/action-posts/*.md", {
        as: "raw",
      });

      const post = Object.entries(postFiles).find(([path]) => {
        const postSlug = path.split("/").pop()?.replace(".md", "") ?? "";
        return postSlug === slug;
      });

      if (!post) {
        setFrontmatter({ title: "Post not found" });
      } else {
        const data = await post[1]();
        const { content, data: frontmatter } = matter(data);

        setContent(content);
        setFrontmatter(frontmatter);
      }
    };

    getPost();
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div className="flex-1 container mx-auto pt-16 md:pt-28 pb-56 flex flex-col px-5">
        <div className="mx-auto w-full max-w-3xl flex flex-col">
          <h2 className="font-adobe !font-semibold !text-2xl md:!text-4xl">
            {frontmatter?.title}
          </h2>
          <p className="text-lg text-zinc-500 mb-2">
            {new Date(frontmatter?.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="self-start text-base text-green border border-green-2 py-1 px-2 bg-green-1/20 rounded mb-8">
            {frontmatter?.members} members
          </p>
          <MarkdownWrapper id="post-content" markdownContent={content ?? ""} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PublicActionPage;
