import React from "react";
import TableOfContents from "./TableOfContents";

interface InfoSubpageProps {
  tocSections?: { id: string; label: string; level: number }[];
  children: React.ReactNode;
}

const InfoSubpage: React.FC<InfoSubpageProps> = ({ tocSections, children }) => {
  return (
    <div className="max-w-6xl mx-auto px-3 py-6 sm:py-10 md:py-16 mb-32 md:mb-64">
      <div className="flex md:gap-8 lg:gap-12">
        {tocSections && <TableOfContents tocSections={tocSections} />}
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
