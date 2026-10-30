import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

// Same 24x24 stroke icons as the design.
const paths: Record<string, React.ReactNode> = {
  flower: (
    <>
      <Path d="M12 12c-4-1-5-5-3-7 2-2 5 0 3 7Z" />
      <Path d="M12 12c1-4 5-5 7-3 2 2 0 5-7 3Z" />
      <Path d="M12 12c4 1 5 5 3 7-2 2-5 0-3-7Z" />
      <Path d="M12 12c-1 4-5 5-7 3-2-2 0-5 7-3Z" />
      <Circle cx="12" cy="12" r="1.5" />
    </>
  ),
  arrow: <Path d="m9 18 6-6-6-6" />,
  back: <Path d="m15 18-6-6 6-6" />,
  mail: (
    <>
      <Rect x="3" y="5" width="18" height="14" rx="3" />
      <Path d="m4 7 8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <Rect x="4" y="10" width="16" height="11" rx="3" />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  user: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  calendar: (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="3" />
      <Path d="M8 3v4m8-4v4M3 10h18" />
    </>
  ),
  home: (
    <>
      <Path d="m3 11 9-8 9 8" />
      <Path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  history: (
    <>
      <Path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <Path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  check: <Path d="m5 12 4 4L19 6" />,
  shield: (
    <>
      <Path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
      <Path d="m9 12 2 2 4-4" />
    </>
  ),
  spark: (
    <>
      <Path d="m12 3 1.4 4.1L17 9l-3.6 1.9L12 15l-1.4-4.1L7 9l3.6-1.9L12 3Z" />
      <Path d="m18.5 15 .7 2.1L21 18l-1.8.9-.7 2.1-.7-2.1L16 18l1.8-.9.7-2.1Z" />
    </>
  ),
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, color = "#000" }: { name: IconName; size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {paths[name]}
    </Svg>
  );
}
