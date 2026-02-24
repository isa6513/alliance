import React from "react";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import alliancePeople from "../../assets/alliance_people.webp";

const PrelaunchLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-white lg:overflow-hidden">
      <PrelaunchNavbar transparent={false} absolute={false} showLogo={false} />
      <div className="flex-1 flex flex-col mx-auto gap-x-16 px-6 lg:px-24 lg:flex-row-reverse lg:overflow-hidden">
        <div className="lg:flex-1 flex items-start lg:items-center justify-center py-4 lg:py-0">
          <div className="flex flex-col gap-y-3 lg:gap-y-8 my-12 max-w-[700px]">
            <p className="font-berlingske uppercase font-medium font-serif text-3xl sm:text-4xl lg:text-5xl text-black">
              The Alliance
            </p>
            <div className="flex flex-col gap-y-3 lg:gap-y-6 text-zinc-900 text-lg lg:text-xl">
              <p>
                The Alliance is a global group of people cooperating to improve
                the world. Our priorities are extreme poverty, environmental
                destruction, the breakdown of democratic institutions, and
                dangerous technological development.
              </p>
              <p>
                We aim to give our members, and ultimately a significant
                proportion of humanity, the ability to make deliberate,
                large-scale change.
              </p>
              <p>
                We are in an experimental phase. Membership is by invitation
                only.
              </p>
            </div>
          </div>
        </div>
        <div className="lg:flex-1 lg:flex lg:items-center lg:justify-center lg:py-8">
          <div className="flex flex-col gap-y-4">
            <img
              src={alliancePeople}
              alt="Alliance members"
              className="w-full lg:max-w-full lg:max-h-full object-contain rounded-md"
            />
            <p className="text-center text-zinc-500">
              A few members gathered in San Francisco, California
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrelaunchLandingPage;
