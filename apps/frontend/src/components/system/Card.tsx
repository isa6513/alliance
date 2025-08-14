import { PropsWithChildren } from "react";

export enum CardStyle {
  White = "white",
  Outline = "outline",
  Alert = "alert",
  Grey = "grey",
  LightGrey = "light-grey",
  Black = "black",
  Image = "image",
  Green = "green",
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
      "bg-white border-gray-2 transition-[border] duration-100 border-box rounded-md",
    [CardStyle.Alert]: "bg-sky-100 border-sky-300",
    [CardStyle.Outline]: "bg-transparent border-gray-300",
    [CardStyle.Grey]: "bg-zinc-100 border-zinc-200 border-[1.5px]",
    [CardStyle.LightGrey]: "bg-page border-zinc-300",
    [CardStyle.Black]: "bg-black border-zinc-300 text-white",
    [CardStyle.Image]: "bg-transparent border-none",
    [CardStyle.Green]: "bg-green-1 border-green-2 rounded-lg",
  };

  return (
    <div
      className={`${flex ? "flex flex-col" : ""} ${
        styleClasses[cardStyle]
      } gap-y-2 rounded p-4 border ${className} ${
        onClick
          ? "cursor-pointer hover:border-gray-3 transition-[border] duration-100"
          : ""
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
