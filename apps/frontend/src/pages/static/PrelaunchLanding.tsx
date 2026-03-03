import React from "react";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import alliancePeople from "../../assets/alliance_people.webp";

const PrelaunchLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} showLogo={false} />
      <div className="flex-1 flex flex-col mx-auto gap-y-8 lg:gap-y-16 py-8 lg:pt-20 lg:pb-36 px-8">
        <div className="flex items-start justify-center py-4 lg:py-0">
          <div className="flex flex-col gap-y-3 lg:gap-y-8 max-w-[700px]">
            <p className="font-berlingske uppercase font-medium font-serif text-3xl lg:text-4xl text-black text-center">
              The Alliance
            </p>
            <div className="flex flex-col gap-y-3 lg:gap-y-6 text-zinc-900 text-lg sm:text-xl lg:text-2xl text-center">
              <p>
                The Alliance is a global group of people cooperating to improve
                the world. We require dependable time commitments from members,
                which allows us to plan and execute precise, effective actions.
              </p>
              <p>
                We are in an experimental, invite-only phase. We aim to give
                members, and ultimately a significant proportion of humanity,
                the ability to make deliberate, large-scale change.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-y-4">
          <img
            src={alliancePeople}
            alt="Alliance members"
            className="w-full lg:max-w-[1000px] lg:max-h-screen object-contain rounded-md"
          />
          <p className="text-center text-zinc-500 text-base lg:text-lg">
            A few members gathered in San Francisco, California
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrelaunchLandingPage;
