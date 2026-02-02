import { ReactNode } from "react";
import { View } from "react-native";

interface ListHeaderProps {
  children: ReactNode;
  className?: string;
}

const baseClassName =
  "bg-green px-4 pt-12 pb-3 flex-row items-center justify-between";

export default function ListHeader({ children, className }: ListHeaderProps) {
  const combinedClassName = className
    ? `${baseClassName} ${className}`
    : baseClassName;

  return <View className={combinedClassName}>{children}</View>;
}
