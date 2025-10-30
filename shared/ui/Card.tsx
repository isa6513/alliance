import { PropsWithChildren } from "react";

export enum CardStyle {
  White = "white",
  LightGreen = "light-green",
  WhiteSolid = "white-solid",
  Outline = "outline",
  Alert = "alert",
  Grey = "grey",
  LightGrey = "light-grey",
  Black = "black",
  Image = "image",
  Green = "green",
  Transparent = "transparent",
  Navy = "navy",
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

  const styleClasses: Record<CardStyle, string> = {
    [CardStyle.White]: "bg-white border-zinc-200 border-box",
    [CardStyle.WhiteSolid]: "bg-white border-none",
    [CardStyle.Alert]: "bg-sky-100 border-sky-300",
    [CardStyle.Outline]: "bg-transparent border-zinc-200 hover:bg-zinc-100",
    [CardStyle.Grey]: "bg-zinc-50 border-zinc-200 border",
    [CardStyle.Navy]: "bg-navy text-white border-none rounded-none",
    [CardStyle.LightGrey]: "bg-[#fcfcfc] border-zinc-300",
    [CardStyle.Black]: "bg-black border-zinc-300 text-white",
    [CardStyle.Image]: "bg-transparent border-none",
    [CardStyle.Green]: "bg-green/20 border-green",
    [CardStyle.Transparent]:
      "bg-transparent border-gray-2 hover:border border-box",
    [CardStyle.LightGreen]: "bg-green/10 border-green/30",
  };

  return (
    <div
      id={id || undefined}
      className={`${flex ? "flex flex-col" : ""} ${
        styleClasses[cardStyle]
      } p-4 border ${className} ${
        onClick ? "cursor-pointer " : ""
      } bg-cover bg-center rounded`}
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
