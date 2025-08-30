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
          <h1 className="!font-semibold !text-2xl" {...props} />
        ),
        h2: ({ ...props }) => (
          <h2 className="!font-semibold text-lg" {...props} />
        ),
        h3: ({ ...props }) => (
          <h3 className="!font-semibold text-lg" {...props} />
        ),
        p: ({ ...props }) => <p className="mb-3 last:mb-0" {...props} />,
        ol: ({ ...props }) => <ol {...props} />,
        ul: ({ ...props }) => <ul {...props} />,
        li: ({ ...props }) => <li {...props} />,
        a: ({ ...props }) => <a className="text-link" {...props} />,
      }}
    >
      {markdownContent}
    </ReactMarkdown>
  );
};

export default AppMarkdownWrapper;
