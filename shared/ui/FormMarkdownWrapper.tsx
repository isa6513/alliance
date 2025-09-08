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
        h1: ({ ...props }) => <h1 className="!font-semibold" {...props} />,
        h2: ({ ...props }) => <h2 className="!font-semibold" {...props} />,
        h3: ({ ...props }) => <h3 className="!font-semibold" {...props} />,
        strong: ({ ...props }) => (
          <strong className="!font-medium" {...props} />
        ),
        p: ({ ...props }) => <p className="" {...props} />,
        ol: ({ ...props }) => <ol className="list-decimal pl-6" {...props} />,
        ul: ({ ...props }) => <ul className="list-disc pl-4" {...props} />,
        li: ({ ...props }) => <li {...props} />,
        a: ({ ...props }) => <a className="text-link" {...props} />,
      }}
    >
      {markdownContent}
    </ReactMarkdown>
  );
};

export default FormMarkdownWrapper;
