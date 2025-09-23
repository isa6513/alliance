import React from "react";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import "./PrelaunchLanding.css";
import Footer from "../../components/Footer";
import MarkdownWrapper from "../../components/MarkdownWrapper";
import earth from "../../assets/earth.png";

const PrelaunchLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div className="flex-1 container mx-auto pt-8 pb-28 md:pb-56 flex flex-col px-5">
        <div className="flex flex-col mx-auto">
          <img src={earth} className="mx-auto mb-12 w-50" />
          <h2 className="text-center font-serif !font-semibold !text-4xl md:!text-8xl">
            The Alliance
          </h2>
          <p className="max-w-2xl font-light text-center mx-auto !mt-4 text-xl md:text-3xl">
            A global group of people taking collective action to advance
            humanity’s common interests.
          </p>

          <div className="mx-auto w-full flex flex-col mt-12 md:mt-18 *:py-12 *:border-t *:border-zinc-300">
            <MarkdownWrapper
              id="introduction"
              maxWidth="max-w-3xl"
              markdownContent="

Today, humanity faces crises that are causing irreversible and compounding harms. Among them are extreme poverty, environmental destruction, breakdown of democratic institutions, and dangerous technological development.

Billions of people agree that these crises are urgent, and moreover have the collective power to solve them, but lack the ability to coordinate.

The Alliance aims to give its members, and ultimately a significant proportion of humanity, the ability to make deliberate, large-scale change. We plan to do so by facilitating strategic, sustained collective action.

We believe that commitment unlocks cooperation. The Alliance is enabled by a voluntary contract that requires members to contribute a small, consistent amount of their time and resources. Membership is currently by invitation only and requires a 15-minute weekly commitment.

While this project is ambitious, we believe it is the right time to undertake it seriously and carefully.

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
