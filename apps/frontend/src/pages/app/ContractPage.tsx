import React from "react";
import MemberContract from "../../components/MemberContract";

const ContractPage: React.FC = () => {
  return (
    <div className="flex flex-col max-w-3xl mx-auto p-3 pt-16 md:pt-12">
      <div className="gap-y-2 flex flex-col text-lg">
        <p className="font-adobe text-3xl font-semibold">Contract</p>
        <MemberContract />
      </div>
    </div>
  );
};

export default ContractPage;
