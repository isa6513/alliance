import matter from "gray-matter";
import React from "react";
import { useLoaderData } from "react-router";
import Footer from "../../components/Footer";
import MarkdownWrapper from "../../components/MarkdownWrapper";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";

export async function loader({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const postFiles = import.meta.glob("/src/action-posts/*.md", {
    as: "raw",
  });

  const post = Object.entries(postFiles).find(([path]) => {
    const postSlug = path.split("/").pop()?.replace(".md", "") ?? "";
    return postSlug === slug;
  });

  if (!post) {
    return {
      content: "Post not found",
      frontmatter: { title: "Post not found" },
    };
  } else {
    const data = await post[1]();
    const { content, data: frontmatter } = matter(data);

    return {
      content,
      frontmatter,
    };
  }
}

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return [{ title: data.frontmatter.title ?? "Alliance" }];
}

const ProgressPostPage: React.FC = () => {
  const { content, frontmatter } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div className="flex-1 container mx-auto pt-16 md:pt-28 pb-56 flex flex-col px-5">
        <div className="mx-auto w-full max-w-3xl flex flex-col">
          <h2 className="font-serif text-center !font-semibold !text-2xl md:!text-5xl mb-2">
            {frontmatter?.title}
          </h2>
          <p className="text-center text-lg text-zinc-500 mb-2">
            {new Date(frontmatter?.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="self-center text-base text-green border border-green py-1 px-2 bg-green/20 rounded mb-16">
            {frontmatter?.members} members
          </p>
          <MarkdownWrapper id="post-content" markdownContent={content ?? ""} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProgressPostPage;
