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
        h1: ({ ...props }) => <h1 className="!font-medium" {...props} />,
        h2: ({ ...props }) => <h2 className="!font-medium" {...props} />,
        h3: ({ ...props }) => <h3 className="!font-medium" {...props} />,
        strong: ({ ...props }) => (
          <strong className="!font-medium" {...props} />
        ),
        p: ({ ...props }) => <p className="text-zinc-800" {...props} />,
        ol: ({ ...props }) => (
          <ol className="text-zinc-800 list-decimal pl-6" {...props} />
        ),
        ul: ({ ...props }) => (
          <ul className="text-zinc-800 list-disc pl-4" {...props} />
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
