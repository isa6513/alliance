import React from "react";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import "./PrelaunchLanding.css";
import Footer from "../../components/Footer";
import MarkdownWrapper from "../../components/MarkdownWrapper";
// import earth from "../../assets/earth.png";

const PrelaunchLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div className="flex-1 container mx-auto pt-16 md:pt-28 pb-56 flex flex-col px-5">
        <div className="flex flex-col max-w-3xl mx-auto">
          <h2 className="text-center font-serif !font-semibold !text-4xl md:!text-7xl">
            The Alliance
          </h2>
          <p className="text-center !mt-4 text-xl md:text-2xl mb-10">
            The Alliance is a group of people who take collective action to
            advance humanity’s common interests.
          </p>
          {/* <img src={earth} className="mx-auto mb-14 w-150" /> */}
          <div className="mx-auto w-full max-w-3xl flex flex-col gap-4 md:gap-12">
            <MarkdownWrapper
              id="introduction"
              markdownContent="

Humanity faces many crises which are unlikely to be resolved by business as usual. Among them are extreme poverty, environmental destruction, breakdown of democratic institutions, and unsafe technological development.

The Alliance aims to give its members, and ultimately a significant proportion of humanity, the ability to make deliberate, large-scale change. It plans to do so by facilitating strategic, sustained collective action.

While this project is ambitious, we believe it is the right time to undertake it seriously and carefully.

**What does membership require?**
Membership currently requires a 15 minute weekly commitment.

**Are you affiliated with any existing political group?** No.

**How can I join?**
Membership is currently by invitation only.

"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrelaunchLandingPage;
