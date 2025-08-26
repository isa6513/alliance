import Card, { CardStyle } from "@alliance/shared/ui/Card";
import React from "react";

interface LandingPageActionCardProps {
  title: string;
  description: string;
  category: string;
  className?: string;
}

const LandingPageActionCard: React.FC<LandingPageActionCardProps> = ({
  title,
  description,
  category,
  className,
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* <StatusIndicator status={Status.InProgress} /> */}
      <Card
        style={CardStyle.Grey}
        className="block bg-page text-[11pt]  min-h-[100px] min-w-[600px]"
      ></Card>
    </div>
  );
};

export default LandingPageActionCard;
