import React, { useEffect, useState } from "react";

interface TableOfContentsProps {
  tocSections: { id: string; label: string; level: number }[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ tocSections }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    tocSections[0]?.id ?? "",
  );

  useEffect(() => {
    if (tocSections.length === 0) return;

    const offsetFromTop = 140;

    const updateActiveSection = () => {
      const activeSection =
        tocSections
          .map(({ id }) => document.getElementById(id))
          .filter((section): section is HTMLElement => Boolean(section))
          .reduce<HTMLElement | null>((currentActiveSection, section) => {
            if (section.getBoundingClientRect().top <= offsetFromTop) {
              return section;
            }
            return currentActiveSection;
          }, null) ?? document.getElementById(tocSections[0].id);

      if (activeSection?.id) {
        setActiveSectionId(activeSection.id);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [tocSections]);

  return (
    <nav
      aria-label="Table of contents"
      className="hidden lg:block shrink-0 w-52"
    >
      <div className="sticky top-22 flex flex-col">
        {tocSections.map(({ id, label, level }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={activeSectionId === id ? "location" : undefined}
            className={
              level === 1
                ? `block py-3 pb-0.5 font-medium first:pt-0 text-xl transition-colors ${
                    activeSectionId === id
                      ? "text-black"
                      : "text-zinc-900 hover:text-black"
                  }`
                : level === 2
                  ? `block py-3 text-base lg:text-lg transition-colors ${
                      activeSectionId === id
                        ? "text-black font-medium"
                        : "text-zinc-500 hover:text-black"
                    }`
                  : `block pl-4 py-1 text-base lg:text-lg transition-colors border-l-2 ${
                      activeSectionId === id
                        ? "text-green font-medium border-green"
                        : "text-zinc-500 hover:text-zinc-900 border-zinc-300"
                    }`
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
