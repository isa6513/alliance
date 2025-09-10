import React from "react";
import ReactMarkdown from "react-markdown";

interface AppMarkdownWrapperProps {
  markdownContent: string;
}

const AppMarkdownWrapper: React.FC<AppMarkdownWrapperProps> = ({
  markdownContent,
}) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ ...props }) => (
          <h1 className="first:mt-0 mt-4 !font-medium !text-2xl" {...props} />
        ),
        h2: ({ ...props }) => (
          <h2 className="first:mt-0 mt-4 !font-medium text-lg" {...props} />
        ),
        h3: ({ ...props }) => (
          <h3 className="first:mt-0 mt-4 !font-medium text-lg" {...props} />
        ),
        p: ({ ...props }) => <p className="" {...props} />,
        strong: ({ ...props }) => (
          <strong className="!font-medium" {...props} />
        ),
        ol: ({ ...props }) => (
          <ol className="list-decimal list-inside pl-2" {...props} />
        ),
        ul: ({ ...props }) => (
          <ul className="list-disc list-inside pl-2" {...props} />
        ),
        li: ({ ...props }) => <li className="my-1" {...props} />,
        a: ({ ...props }) => <a className="text-link" {...props} />,
      }}
    >
      {markdownContent}
    </ReactMarkdown>
  );
};

export default AppMarkdownWrapper;
