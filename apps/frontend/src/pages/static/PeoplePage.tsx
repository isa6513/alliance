import React from "react";
import Footer from "../../components/Footer";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import MarkdownWrapper from "../../components/MarkdownWrapper";

const PeoplePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div className="flex-1 container mx-auto pt-16 md:pt-28 pb-56 flex flex-col px-5">
        <div className="mx-auto w-full max-w-3xl flex flex-col md:gap-6">
          <h2 className="font-adobe !font-semibold !text-4xl md:!text-6xl">
            People
          </h2>

          <MarkdownWrapper
            id="people"
            markdownContent="

The Alliance is composed of a full-time Strategic Office and a body of members.

## Strategic Office
- [Mark Xu](https://markxu.com/)
- [Sidney Hough](https://sidney.com/)
- [Casey Manning](https://caseymanning.github.io/)

## Members
We have 25 members who are participating in early experiments.

"
          />
        </div>
      </div>
    </div>
  );
};

export default PeoplePage;
