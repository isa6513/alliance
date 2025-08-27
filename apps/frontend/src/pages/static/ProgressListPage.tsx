import Card, { CardStyle } from "@alliance/shared/ui/Card";
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
          <h2 className="font-adobe !font-semibold !text-4xl md:!text-6xl">
            Progress
          </h2>
          <div className="flex flex-col gap-y-4">
            {posts.map((post) => (
              <Link to={`/progress/${post.slug}`} key={post.slug}>
                <Card
                  style={CardStyle.Outline}
                  className="hover:border-zinc-400 transition-all duration-100"
                >
                  <div className="p-0.5">
                    <div className="flex justify-between">
                      <p className="text-base md:text-xl">
                        {post.frontmatter.title}
                      </p>
                      <p className="text-sm md:text-base text-green border border-green-2 py-1 px-2 bg-green-1/20 rounded">
                        {post.frontmatter.members} members
                      </p>
                    </div>

                    <p className="text-sm md:text-base text-zinc-500">
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
                </Card>
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
