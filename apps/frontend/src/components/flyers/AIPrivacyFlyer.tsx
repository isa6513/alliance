const generateBarcodeUrl = (url: string) => {
  return (
    "https://api.qrserver.com/v1/create-qr-code/?data=" + url + "&size=100x100"
  );
};

interface AIPrivacyFlyerProps {
  url: string;
}

const AIPrivacyFlyer: React.FC<AIPrivacyFlyerProps> = ({
  url,
}: AIPrivacyFlyerProps) => {
  const qrCodeUrl = generateBarcodeUrl(url);
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
        This experiment is being run by the Alliance, a group of people working
        together to improve the world.
      </p>
    </>
  );
};

export default AIPrivacyFlyer;
