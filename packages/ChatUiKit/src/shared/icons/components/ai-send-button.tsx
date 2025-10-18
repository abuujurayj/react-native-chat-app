import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgComponent({ width = 20, height = 20, color = "#000", ...props }) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <Path
        d="M10 16.667V3.333m0 0l-5 5m5-5l5 5"
        stroke={color}       
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
