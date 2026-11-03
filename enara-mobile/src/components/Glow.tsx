import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

/** CSS radial-gradient(circle at cx% cy%, color, transparent r%) as an overlay. cx, cy, r are fractions. */
export function Glow({ cx, cy, r, color = "255,255,255", alpha = 0.8 }: { cx: number; cy: number; r: number; color?: string; alpha?: number }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  // CSS "farthest-corner" sizing
  const px = cx * size.w;
  const py = cy * size.h;
  const far = Math.hypot(Math.max(px, size.w - px), Math.max(py, size.h - py));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={onLayout}>
      {size.w > 0 ? (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <RadialGradient id="g" cx={px} cy={py} r={far * r} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={`rgb(${color})`} stopOpacity={alpha} />
              <Stop offset="1" stopColor={`rgb(${color})`} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={size.w} height={size.h} fill="url(#g)" />
        </Svg>
      ) : null}
    </View>
  );
}
