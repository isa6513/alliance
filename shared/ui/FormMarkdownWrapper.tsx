import React from "react";
import ReactMarkdown from "react-markdown";

interface FormMarkdownWrapper {
  markdownContent: string;
}

const FormMarkdownWrapper: React.FC<FormMarkdownWrapper> = ({
  markdownContent,
}) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ ...props }) => (
          <h1 className="!font-semibold first:mt-0 mt-4" {...props} />
        ),
        h2: ({ ...props }) => (
          <h2 className="!font-semibold first:mt-0 mt-4" {...props} />
        ),
        h3: ({ ...props }) => (
          <h3 className="!font-semibold first:mt-0 mt-4" {...props} />
        ),
        strong: ({ ...props }) => (
          <strong className="!font-semibold" {...props} />
        ),
        p: ({ ...props }) => (
          <p className="text-zinc-800 first:mt-0 mt-2" {...props} />
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
        a: ({ ...props }) => <a className="text-link" {...props} />,
      }}
    >
      {markdownContent}
    </ReactMarkdown>
  );
};

export default FormMarkdownWrapper;
