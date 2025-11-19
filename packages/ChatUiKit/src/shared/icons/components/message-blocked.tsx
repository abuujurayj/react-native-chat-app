import Svg, { Mask, Path, G } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgComponent = ({ height, width, color }: SvgProps) => (
  <Svg
    width={width}
    height={height}
    fill="none"
    color={color}
    viewBox="0 0 16 16"
  >
    <Mask
      id="prefix__a"
      width={16}
      height={16}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "alpha",
      }}
    >
      <Path fill="#D9D9D9" d="M0 0h16v16H0z" />
    </Mask>
    <G mask="url(#prefix__a)">
      <Path
        fill="#F44649"
        d="M2.283 13.667a.583.583 0 0 1-.514-.301.64.64 0 0 1-.086-.292.54.54 0 0 1 .085-.311l5.707-9.859a.6.6 0 0 1 .524-.301q.154 0 .293.073.14.074.232.228l5.707 9.859q.093.153.085.31a.64.64 0 0 1-.296.51.57.57 0 0 1-.304.084zm5.716-1.795q.229 0 .384-.155a.52.52 0 0 0 .155-.384.52.52 0 0 0-.155-.383.52.52 0 0 0-.384-.155.52.52 0 0 0-.383.155.52.52 0 0 0-.155.383q0 .229.155.384a.52.52 0 0 0 .383.155m0-1.744q.213 0 .357-.144a.48.48 0 0 0 .143-.356V7.295a.48.48 0 0 0-.143-.356.48.48 0 0 0-.357-.144.48.48 0 0 0-.356.144.48.48 0 0 0-.144.356v2.333q0 .213.144.356a.48.48 0 0 0 .357.144"
      />
    </G>
  </Svg>
);
export default SvgComponent;
