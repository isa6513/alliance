import React from "react";
import ReactMarkdown from "react-markdown";
import { getApiUrl } from "../lib/config";

interface AppMarkdownWrapperProps {
  markdownContent: string;
  className?: string;
}

const AppMarkdownWrapper: React.FC<AppMarkdownWrapperProps> = ({
  markdownContent,
  className,
}) => {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <h1
              className="first:mt-0 mt-6 !font-semibold !text-2xl"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2 className="first:mt-0 mt-6 !font-semibold text-lg" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="first:mt-0 mt-6 !font-semibold text-lg" {...props} />
          ),
          p: ({ ...props }) => <p className="first:mt-0 mt-4" {...props} />,
          strong: ({ ...props }) => (
            <strong className="!font-semibold" {...props} />
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
        urlTransform={(url) => {
          if (url.startsWith("http")) {
            return url;
          }
          return `${getApiUrl()}/images/${url}`;
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default AppMarkdownWrapper;
