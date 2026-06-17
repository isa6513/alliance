import { cn } from "@alliance/shared/styles/util";
import React from "react";
import ReactMarkdown from "react-markdown";
import ActionLink, { getActionIdFromHref } from "./ActionLink";

interface FormMarkdownWrapper {
  markdownContent: string;
  inline?: boolean;
}

const FormMarkdownWrapper: React.FC<FormMarkdownWrapper> = ({
  markdownContent,
  inline = false,
}) => {
  const inlineClass = inline ? "inline" : "";
  return (
    <ReactMarkdown
      components={{
        h1: ({ ...props }) => (
          <h1
            className={cn("!font-semibold first:mt-0 mt-6", inlineClass)}
            {...props}
          />
        ),
        h2: ({ ...props }) => (
          <h2
            className={cn("!font-semibold first:mt-0 mt-6", inlineClass)}
            {...props}
          />
        ),
        h3: ({ ...props }) => (
          <h3
            className={cn("!font-semibold first:mt-0 mt-6", inlineClass)}
            {...props}
          />
        ),
        strong: ({ ...props }) => (
          <strong className={cn("!font-semibold", inlineClass)} {...props} />
        ),
        p: ({ ...props }) => (
          <p
            className={cn("text-zinc-800 first:mt-0 mt-4", inlineClass)}
            {...props}
          />
        ),
        ol: ({ ...props }) => (
          <ol
            className="text-zinc-800 list-decimal list-inside pl-2"
            {...props}
          />
        ),
        ul: ({ ...props }) => (
          <ul className="text-zinc-800 list-disc list-inside pl-2" {...props} />
        ),
        li: ({ ...props }) => <li className="text-zinc-800 my-1" {...props} />,
        a: ({ node: _node, ...props }) =>
          getActionIdFromHref(props.href) != null ? (
            <ActionLink className={cn(inlineClass)} {...props} />
          ) : (
            <a
              className={cn("text-link", inlineClass)}
              {...props}
              target="_blank"
              rel="noreferrer"
            />
          ),
        code: ({ node: _node, className: _className, ...props }) => (
          <code
            className={cn(
              "rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.9em]",
              inlineClass,
            )}
            {...props}
          />
        ),
        pre: ({ node: _node, ...props }) => (
          <pre
            className="my-4 overflow-x-auto rounded bg-zinc-100 p-3 font-mono text-[0.85em] [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[1em]"
            {...props}
          />
        ),
        blockquote: ({ node: _node, ...props }) => (
          <blockquote
            className="border-l-2 border-zinc-300 pl-4 my-4 text-zinc-800"
            {...props}
          />
        ),
      }}
    >
      {markdownContent}
    </ReactMarkdown>
  );
};

export default FormMarkdownWrapper;
