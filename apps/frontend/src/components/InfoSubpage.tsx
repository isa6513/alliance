import { cn } from "@alliance/shared/styles/util";
import React from "react";
import { useNavbarOptions } from "../lib/NavbarOptionsContext";
import TableOfContents, { TocSection } from "./TableOfContents";

interface InfoSubpageProps {
  tocSections?: TocSection[];
  children: React.ReactNode;
}

const InfoSubpage: React.FC<InfoSubpageProps> = ({ tocSections, children }) => {
  useNavbarOptions({ whiteBackground: true });

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-3 pt-6 sm:py-10 md:py-16 pb-32 md:pb-64">
        <div className="flex md:gap-8 lg:gap-12">
          {tocSections && <TableOfContents tocSections={tocSections} />}
          <div
            className={cn(
              "min-w-0 flex-1 max-w-3xl flex flex-col",
              !tocSections && "mx-auto",
            )}
          >
            <div className="flex flex-col gap-y-12 text-base md:text-lg text-zinc-900">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSubpage;
