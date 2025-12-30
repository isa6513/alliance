import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import bgImage from "../assets/fakebgimage.png";

export interface IssueCardProps {
  name: string;
  description: string;
  href: string;
}

const IssueCard: React.FC<IssueCardProps> = ({ name, description, href }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(href);
  }, [href, navigate]);

  return (
    <Card
      className="flex-col flex-nowrap transition-all duration-300 relative !p-8 justify-end min-h-[300px]"
      onClick={handleClick}
      style={CardStyle.Outline}
      bgImage={bgImage}
    >
      <div className=" space-y-2">
        <h2 className="font-serif font-normal !text-4xl">{name}</h2>
        <p className="text-bold">{description}</p>
      </div>
    </Card>
  );
};

export default IssueCard;
