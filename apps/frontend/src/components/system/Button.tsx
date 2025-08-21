import React from "react";

type ButtonProps = React.PropsWithChildren & {
  className?: string;
  color?: ButtonColor;
  disabled?: boolean;
} & (
    | {
        type: "submit";
        onClick?: (e: React.FormEvent) => void;
      }
    | {
        type?: "button" | "reset";
        onClick: (e: React.MouseEvent) => void;
      }
  ) &
  Pick<
    React.HTMLAttributes<HTMLButtonElement>,
    "onMouseEnter" | "onMouseLeave"
  >;

export enum ButtonColor {
  Stone = "bg-gray-4 text-white hover:bg-[#444]",
  Green = "bg-green text-white hover:bg-[#4d8c1d]",
  Red = "bg-red-100 !text-red-500",
  Light = "bg-stone-200",
  Blue = "bg-[#318dde] text-white",
  Yellow = "bg-yellow-600",
  Transparent = "bg-transparent hover:bg-gray-100 text-black",
  Grey = "bg-gray-200 !text-black",
  Outline = "border border-gray-2 text-black",
  White = "border border-gray-2 text-black bg-white hover:bg-gray-50",
  Black = "bg-gray-4 text-white",
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  className,
  color: colorProp,
  type = "button",
  disabled = false,
  onMouseEnter,
  onMouseLeave,
}) => {
  const color = colorProp ?? ButtonColor.Stone;
  return (
    <button
      type={type}
      className={`px-4 py-2 text-sm font-medium w-fit h-fit rounded flex items-center justify-center ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-${ButtonColorClasses[color]}-100"
      } ${color} ${
        color === ButtonColor.Light ? "!text-stone-800" : ""
      } ${className} `}
      style={{
        fontWeight: 450,
      }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </button>
  );
};

export default Button;
