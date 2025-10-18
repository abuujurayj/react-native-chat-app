import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgComponent({ width = 24, height = 24, color = "#A1A1A1", ...props }) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M11.167 12.833H5.833a.805.805 0 01-.594-.24.811.811 0 01-.239-.596.8.8 0 01.24-.593.81.81 0 01.593-.237h5.334V5.833c0-.236.08-.434.24-.594.16-.16.359-.239.596-.239a.8.8 0 01.593.24.81.81 0 01.237.593v5.334h5.334c.236 0 .434.08.593.24.16.16.24.359.24.596a.8.8 0 01-.24.593.81.81 0 01-.593.237h-5.334v5.334c0 .236-.08.434-.24.593a.811.811 0 01-.596.24.8.8 0 01-.593-.24.81.81 0 01-.237-.593v-5.334z"
        fill={color}
      />
    </Svg>
  );
}

export default SvgComponent;
