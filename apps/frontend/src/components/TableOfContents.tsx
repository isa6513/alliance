import React from "react";

interface TableOfContentsProps {
  tocSections: { id: string; label: string; level: number }[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ tocSections }) => {
  return (
    <nav
      aria-label="Table of contents"
      className="hidden lg:block shrink-0 w-52"
    >
      <div className="sticky top-12 flex flex-col gap-1">
        {tocSections.map(({ id, label, level }) => (
          <a
            key={id}
            href={`#${id}`}
            className={
              level === 1
                ? "pt-2 pb-0.5 font-semibold text-zinc-900 hover:text-black first:pt-0 text-xl"
                : level === 2
                ? "py-1 text-zinc-500 hover:text-black text-base"
                : "pl-4 py-0.5 text-zinc-500 hover:text-zinc-900 text-base"
            }
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default TableOfContents;
