import { PropsWithChildren } from "react";

export enum CardStyle {
  White = "white",
  WhiteFlatBottom = "white-flat-bottom",
  Outline = "outline",
  GreenOutline = "green-outline",
  Alert = "alert",
  Grey = "grey",
  LightGrey = "light-grey",
  Black = "black",
  Image = "image",
  Green = "green",
  Transparent = "transparent",
}

export interface CardProps extends PropsWithChildren {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: CardStyle;
  bgImage?: string;
  closed?: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
  flex?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  style,
  bgImage,
  closed,
  ref,
  flex = true,
}: CardProps) => {
  const cardStyle = style ?? CardStyle.White;

  const styleClasses = {
    [CardStyle.White]:
      "bg-white border-gray-2 hover:border border-box rounded-md",
    [CardStyle.WhiteFlatBottom]:
      "bg-white border-gray-2  border-box rounded-t-md",
    [CardStyle.Alert]: "bg-sky-100 border-sky-300",
    [CardStyle.Outline]: "bg-transparent border-gray-300",
    [CardStyle.Grey]: "bg-zinc-100 border-zinc-200 border-[1.5px]",
    [CardStyle.LightGrey]: "bg-page border-zinc-300 rounded-md",
    [CardStyle.Black]: "bg-black border-zinc-300 text-white",
    [CardStyle.Image]: "bg-transparent border-none",
    [CardStyle.Green]: "bg-green-1 border-green-2 rounded-lg",
    [CardStyle.GreenOutline]: "border-green-2 bg-green-1/20",
    [CardStyle.Transparent]:
      "bg-transparent border-gray-2 hover:border border-box rounded-md",
  };

  return (
    <div
      className={`${flex ? "flex flex-col" : ""} ${
        styleClasses[cardStyle]
      }  p-4 border ${className} ${
        onClick ? "cursor-pointer hover:border-gray-3" : ""
      } bg-cover bg-center`}
      ref={ref}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        height: closed ? "0px" : "calc-size(auto, size)",
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
