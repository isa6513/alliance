import {
  checkIconCircle,
  checkIconPath,
  checkIconViewBox,
} from "@alliance/shared/icons/checkIcon";
import Svg, { Circle, Path, type SvgProps } from "react-native-svg";
import { colors } from "../../lib/style/colors";

interface CheckIconProps extends SvgProps {
  size?: number;
  color?: string;
  absoluteStrokeWidth?: boolean;
}

const CheckIcon = ({
  size = 24,
  color = colors.green,
  absoluteStrokeWidth: _asw,
  ...props
}: CheckIconProps) => (
  <Svg width={size} height={size} viewBox={checkIconViewBox} {...props}>
    <Circle {...checkIconCircle} fill={color} />
    <Path d={checkIconPath} fill="#fff" />
  </Svg>
);

export default CheckIcon;
