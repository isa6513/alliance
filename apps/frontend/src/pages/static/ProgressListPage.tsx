import matter from "gray-matter";
import React from "react";
import { Link, useLoaderData } from "react-router";
import Footer from "../../components/Footer";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";

export async function loader() {
  const postFiles = import.meta.glob("/src/action-posts/*.md", {
    as: "raw",
  });

  const posts = await Promise.all(
    Object.entries(postFiles).map(async ([path, data]) => {
      const { content, data: frontmatter } = matter(await data());
      return {
        slug: path.split("/").pop()?.replace(".md", "") ?? "",
        frontmatter,
        content,
      };
    })
  );

  return posts;
}

const ProgressListPage: React.FC = () => {
  const posts = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div className="flex-1 container mx-auto pt-16 md:pt-28 pb-56 flex flex-col px-5">
        <div className="mx-auto w-full max-w-3xl flex flex-col gap-4 md:gap-6">
          <h2 className="font-serif !font-medium !text-4xl md:!text-5xl mb-6">
            Progress
          </h2>
          <div className="flex flex-col gap-y-4">
            {posts.map((post) => (
              <Link
                to={`/progress/${post.slug}`}
                key={post.slug}
                className="hover:bg-zinc-100 p-3 -m-3 rounded-lg transition-all duration-50"
              >
                {/* <Card
                  style={CardStyle.White}
                  className="hover:border-zinc-400 transition-all duration-100"
                > */}
                <div className="p-0.5">
                  <div className="flex justify-between">
                    <p className="text-base md:text-3xl font-serif">
                      {post.frontmatter.title}
                    </p>
                    <p className="text-sm md:text-base text-green border border-green py-1 px-2 bg-green/20 rounded">
                      {post.frontmatter.members} members
                    </p>
                    {/* <Tag style={TagStyle.Green} size="large">
                      {post.frontmatter.members} members
                    </Tag> */}
                  </div>

                  <p className="text-sm md:text-lg text-zinc-500">
                    {new Date(post.frontmatter.date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                {/* </Card> */}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProgressListPage;
