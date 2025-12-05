import React from "react";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import "./PrelaunchLanding.css";
import Footer from "../../components/Footer";

const PrelaunchLandingPage: React.FC = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-white">
        <PrelaunchNavbar transparent={false} absolute={false} />
        <div className="flex-1 container mx-auto flex flex-col px-5 py-5">
          <div className="flex flex-col mx-auto my-auto max-w-2xl py-12 sm:py-24 lg:py-36">
            {/* <img src={earth} className="mx-auto mb-12 w-50" /> */}

            <div className="mx-auto w-full flex flex-col gap-y-6">
              <p className="font-semibold text-3xl font-serif ">
                We are coordinating to combat global crises.
              </p>

              <p className="text-lg">
                Humanity faces crises that are causing irreversible and
                compounding harms. Among them are extreme poverty, environmental
                destruction, breakdown of democratic institutions, and dangerous
                technological development.
              </p>

              <p className="text-lg">
                The Alliance aims to give its members, and ultimately a
                significant proportion of humanity, the ability to make
                deliberate, large-scale change. We plan to do so by facilitating
                strategic, sustained collective action.
              </p>

              <p className="text-lg">
                The Alliance is built on commitment. Members contribute a small,
                consistent amount of their time, which allows us to make
                concrete and effective action plans.
              </p>

              <p className="text-lg">
                We are in an experimental phase. Membership is by invitation
                only.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrelaunchLandingPage;
