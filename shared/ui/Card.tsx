import { PropsWithChildren } from "react";

export enum CardStyle {
  White = "white",
  WhiteSolid = "white-solid",
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
  ref?: React.RefObject<HTMLDivElement | null>;
  flex?: boolean;
  id?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  style,
  bgImage,
  ref,
  flex = true,
  id,
}: CardProps) => {
  const cardStyle = style ?? CardStyle.White;

  const styleClasses = {
    [CardStyle.White]:
      "bg-white border-gray-2 hover:border border-box rounded-md",
    [CardStyle.WhiteSolid]: "bg-white border-none rounded-lg",
    [CardStyle.Alert]: "bg-sky-100 border-sky-300",
    [CardStyle.Outline]: "bg-transparent border-gray-300",
    [CardStyle.Grey]: "bg-zinc-100 border-zinc-200 border-[1.5px]",
    [CardStyle.LightGrey]: "bg-[#fcfcfc] border-zinc-300 rounded-md",
    [CardStyle.Black]: "bg-black border-zinc-300 text-white",
    [CardStyle.Image]: "bg-transparent border-none",
    [CardStyle.Green]: "bg-green-1 border-green-2 rounded-lg",
    [CardStyle.GreenOutline]: "border-green-2 bg-green-1/40 rounded",
    [CardStyle.Transparent]:
      "bg-transparent border-gray-2 hover:border border-box rounded-md",
  };

  return (
    <div
      id={id || undefined}
      className={`${flex ? "flex flex-col" : ""} ${
        styleClasses[cardStyle]
      }  p-4 border ${className} ${
        onClick ? "cursor-pointer hover:border-gray-3" : ""
      } bg-cover bg-center`}
      ref={ref}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
