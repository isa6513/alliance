import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@alliance/shared/styles/util";

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
        a: ({ ...props }) => (
          <a
            className={cn("text-link", inlineClass)}
            {...props}
            target="_blank"
            rel="noreferrer"
          />
        ),
      }}
    >
      {markdownContent}
    </ReactMarkdown>
  );
};

export default FormMarkdownWrapper;
