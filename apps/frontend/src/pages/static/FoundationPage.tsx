import React from "react";
import Footer from "../../components/Footer";
import MarkdownWrapper from "../../components/MarkdownWrapper";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";

const FoundationPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <div className="flex flex-col md:flex-row mx-2 sm:mx-4 md:mx-12 pt-8 md:pt-32 pb-56 justify-center">
        <div className="flex flex-col max-w-[46rem]">
          <div className="mx-auto w-full mb-4 md:mb-6">
            <h2 className="font-serif !font-semibold !text-4xl md:!text-6xl mb-3 text-black">
              Foundation
            </h2>
          </div>

          <div className="flex flex-col gap-y-6">
            <MarkdownWrapper
              id="foundation"
              className=""
              markdownContent="
The founding principle of the Alliance is that one should not treat others in ways that one does not want to be treated. The Alliance holds itself and others accountable to this principle.

Therefore, the goal of the Alliance is to create a world in which:
1. Every individual has the resources and freedom to achieve happiness and fulfillment, as most individuals do not want others to deprive them of such opportunity;
2. Every individual lives free of political, economic, and environmental insecurity, as most individuals do not want others to impose such conditions upon them;
3. Humanity’s most important decisions are made with substantive democratic input, as most individuals do not want to be excluded from such decisions.

Therefore, the initial priorities of the Alliance are to address the following global crises: extreme poverty, environmental destruction, the decline of democratic institutions, and dangerous technological development.
"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FoundationPage;
