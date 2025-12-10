import CenterLayout from "@alliance/shared/ui/CenterLayout";
import ExportableFlyer from "../../components/ExportableFlyer";
import AIPrivacyFlyer from "../../components/flyers/AIPrivacyFlyer";

const FlyerExportPage: React.FC = () => {
  return (
    <CenterLayout>
      <h1 className="text-2xl font-semibold font-serif mb-4">
        Export custom flyer
      </h1>

      <ExportableFlyer filename="ai-privacy-flyer.pdf">
        <AIPrivacyFlyer url="https://worldalliance.org" />
      </ExportableFlyer>
    </CenterLayout>
  );
};

export default FlyerExportPage;
