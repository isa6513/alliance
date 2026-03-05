import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import React from "react";
import { cn } from "@alliance/shared/styles/util";

interface LandingPageActionCardProps {
  title: string;
  description: string;
  category: string;
  className?: string;
}

const LandingPageActionCard: React.FC<LandingPageActionCardProps> = ({
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      <Card
        style={CardStyle.Grey}
        className="block bg-page text-[11pt]  min-h-[100px] min-w-[600px]"
      ></Card>
    </div>
  );
};

export default LandingPageActionCard;
