import React from "react";
import FormMarkdownWrapper from "../ui/FormMarkdownWrapper";
import type { DisplayBlock } from "./display-blocks";
import { getApiUrl } from "../lib/config";

type Props = {
  block: DisplayBlock;
};

export default function RenderDisplayBlock({ block }: Props) {
  switch (block.kind) {
    case "header":
      return React.createElement(
        `h${block.level || 2}`,
        {
          className: `font-medium text-zinc-900 ${
            (block.level || 2) === 1
              ? "text-3xl"
              : (block.level || 2) === 2
              ? "text-2xl"
              : (block.level || 2) === 3
              ? "text-xl"
              : (block.level || 2) === 4
              ? "text-lg"
              : (block.level || 2) === 5
              ? "text-base"
              : ""
          }`,
        },
        block.text
      );

    case "text":
      return (
        <div className="text-zinc-900">
          {block.markdown ? (
            <div className="prose prose-sm max-w-none">
              <FormMarkdownWrapper markdownContent={block.text} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{block.text}</p>
          )}
        </div>
      );

    case "label":
      return <span className="  text-gray-700">{block.text}</span>;

    case "divider":
      return (
        <hr
          className={`border-gray-300 ${
            block.thickness === "hairline"
              ? "border-t"
              : block.thickness === "thin"
              ? "border-t"
              : block.thickness === "medium"
              ? "border-t-2"
              : block.thickness === "thick"
              ? "border-t-4"
              : "border-t"
          }`}
        />
      );

    case "spacer":
      return (
        <div
          className={`${
            block.size === "xs"
              ? "h-2"
              : block.size === "sm"
              ? "h-4"
              : block.size === "md"
              ? "h-8"
              : block.size === "lg"
              ? "h-16"
              : block.size === "xl"
              ? "h-24"
              : "h-8"
          }`}
        />
      );

    case "html":
      return <div dangerouslySetInnerHTML={{ __html: block.html }} />;

    case "image":
      return (
        <img
          src={
            block.src.includes("/")
              ? block.src
              : `${getApiUrl()}/images/${block.src}`
          }
          alt={block.alt}
          className="max-h-80 w-auto rounded"
          style={{
            aspectRatio: block.aspectRatio
              ? block.aspectRatio.toString()
              : undefined,
          }}
        />
      );

    default:
      return null;
  }
}
