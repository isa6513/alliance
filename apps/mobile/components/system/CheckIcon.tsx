import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../../lib/style/colors";
import { cn } from "@alliance/shared/styles/util";

const sizeMap = {
  line: 16,
  mini: 20,
  small: 24,
  large: 32,
  xl: 40,
};

const CheckIcon = ({
  size = "small",
  filled = true,
}: {
  size?: "line" | "small" | "large" | "mini" | "xl";
  filled?: boolean;
}) => {
  const sizeClass = {
    line: "w-4 h-4 mt-[4px]",
    mini: "w-5 h-5",
    small: "w-6 h-6",
    large: "w-8 h-8",
    xl: "w-10 h-10",
  };
  const dimension = sizeMap[size];

  return (
    <View
      className={cn(
        "shrink-0",
        sizeClass[size],
        filled ? "bg-green" : "bg-white",
        "rounded-full items-center justify-center"
      )}
    >
      <Svg
        viewBox="0 0 88 88"
        width={dimension}
        height={dimension}
        fill={filled ? "#fff" : colors.green}
      >
        <Path d="M36.9 62.4001L20 45.4001L25.6 39.8001L36.9 51.1001L62.4 25.6001L68 31.3001L36.9 62.4001Z" />
      </Svg>
    </View>
  );
};

export default CheckIcon;
