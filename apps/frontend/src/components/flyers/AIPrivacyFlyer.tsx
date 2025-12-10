import { generateBarcodeUrl } from "../../lib/utils";

interface AIPrivacyFlyerProps {
  url: string;
}

const AIPrivacyFlyer: React.FC<AIPrivacyFlyerProps> = ({
  url,
}: AIPrivacyFlyerProps) => {
  const qrCodeUrl = generateBarcodeUrl(url, 200);
  return (
    <>
      <h1 className="text-[0.3in] font-bold font-serif">
        Participate in an experiment on ethical AI privacy settings
      </h1>
      <p className="text-[0.2in] mt-[0.2in] mb-[0.4in]">
        We are running an experiment to understand how people prefer AI
        companies use their data.
      </p>

      <img src={qrCodeUrl} alt="QR Code" className="w-[2in] h-[2in]" />

      <p className="text-[0.2in] mt-[0.4in] mb-[0.4in]">
        This experiment is being run by the Alliance, an online community taking
        weekly actions to improve the world.
      </p>
    </>
  );
};

export default AIPrivacyFlyer;
