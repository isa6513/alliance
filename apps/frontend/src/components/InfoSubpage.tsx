import React from "react";

interface InfoSubpageProps {
  tocSections?: { id: string; label: string; level: number }[];
  children: React.ReactNode;
}

const InfoSubpage: React.FC<InfoSubpageProps> = ({ tocSections, children }) => {
  return (
    <div className="max-w-6xl mx-auto px-3 py-6 sm:py-10 md:py-16 mb-32 md:mb-64">
      <div className="flex md:gap-8 lg:gap-12">
        {tocSections && (
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
        )}
        <div
          className={`min-w-0 flex-1 max-w-3xl flex flex-col ${
            !tocSections ? "mx-auto" : ""
          }`}
        >
          <div className="flex flex-col gap-y-12 text-base md:text-lg text-zinc-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSubpage;
