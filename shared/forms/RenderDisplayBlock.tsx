/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import FormMarkdownWrapper from "../ui/FormMarkdownWrapper";
import type { DisplayBlock } from "./display-blocks";

type Props = {
  block: DisplayBlock;
};

export default function RenderDisplayBlock({ block }: Props) {
  switch (block.kind) {
    case "header":
      return React.createElement(
        `h${(block as any).level || 2}`,
        {
          className: `font-medium text-zinc-900 ${
            ((block as any).level || 2) === 1
              ? "text-3xl"
              : ((block as any).level || 2) === 2
              ? "text-2xl"
              : ((block as any).level || 2) === 3
              ? "text-xl"
              : ((block as any).level || 2) === 4
              ? "text-lg"
              : ((block as any).level || 2) === 5
              ? "text-base"
              : ""
          }`,
        },
        (block as any).text
      );

    case "text":
      return (
        <div className="text-zinc-900">
          {(block as any).markdown ? (
            <div className="prose prose-sm max-w-none">
              <FormMarkdownWrapper markdownContent={(block as any).text} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{(block as any).text}</p>
          )}
        </div>
      );

    case "label":
      return <span className="  text-gray-700">{(block as any).text}</span>;

    case "divider":
      return (
        <hr
          className={`border-gray-300 ${
            (block as any).thickness === "hairline"
              ? "border-t"
              : (block as any).thickness === "thin"
              ? "border-t"
              : (block as any).thickness === "medium"
              ? "border-t-2"
              : (block as any).thickness === "thick"
              ? "border-t-4"
              : "border-t"
          }`}
        />
      );

    case "spacer":
      return (
        <div
          className={`${
            (block as any).size === "xs"
              ? "h-2"
              : (block as any).size === "sm"
              ? "h-4"
              : (block as any).size === "md"
              ? "h-8"
              : (block as any).size === "lg"
              ? "h-16"
              : (block as any).size === "xl"
              ? "h-24"
              : "h-8"
          }`}
        />
      );

    case "html":
      return <div dangerouslySetInnerHTML={{ __html: (block as any).html }} />;

    case "image":
      return (
        <img
          src={(block as any).src}
          alt={(block as any).alt}
          className="max-h-80 w-auto rounded"
          style={{
            aspectRatio: (block as any).aspectRatio
              ? (block as any).aspectRatio.toString()
              : undefined,
          }}
        />
      );

    default:
      return null;
  }
}
