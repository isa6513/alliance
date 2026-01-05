import Svg, { Path } from "react-native-svg";
import { colors } from "../../lib/style/colors";

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
  return (
    <Svg
      viewBox="0 0 88 88"
      className={`shrink-0 ${sizeClass[size]} ${
        filled ? "bg-green" : "bg-white"
      } rounded-full`}
      fill={filled ? "#fff" : colors.green}
      aria-label="Done"
    >
      <Path d="M36.9 62.4001L20 45.4001L25.6 39.8001L36.9 51.1001L62.4 25.6001L68 31.3001L36.9 62.4001Z" />
    </Svg>
  );
};

export default CheckIcon;
