export const sizeClass = {
  mini: "w-2.5 h-2.5",
  small: "w-3 h-3",
  medium: "w-4 h-4",
  large: "w-5 h-5",
};

export interface DefaultIconProps {
  size?: keyof typeof sizeClass;
  fill?: string;
}
