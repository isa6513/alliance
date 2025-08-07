import { useState } from "react";

enum OnboardingSlide {
  Welcome,
  App,
  Agreement,
}

const OnboardingPage: React.FC = () => {
  const [slide, setSlide] = useState<OnboardingSlide>(OnboardingSlide.Welcome);

  const handleNext = () => {
    setSlide(slide + 1);
  };

  const handleBack = () => {
    setSlide(slide - 1);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto"></div>
    </div>
  );
};

export default OnboardingPage;
