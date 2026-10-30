import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../theme";
import { Icon, IconName } from "./Icon";
import { Level } from "../scoring";

/** The design's conic-gradient score ring, drawn with SVG. `p` is 0-1. */
export function ScoreRing({ p, label, text }: { p: number; label: string; text: string }) {
  const size = 152;
  const stroke = 13;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 25, marginBottom: 20 }, ring.shadow]}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="#f9f6f7" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(103,54,81,0.13)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.plum}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * Math.min(1, Math.max(0.02, p))} ${c}`}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={ring.value} accessibilityLabel={`${text} ${label}`}>{text}</Text>
      <Text style={ring.caption}>{label}</Text>
    </View>
  );
}

const ring = StyleSheet.create({
  shadow: { shadowColor: colors.plumDark, shadowOpacity: 0.12, shadowRadius: 17, shadowOffset: { width: 0, height: 14 }, elevation: 6 },
  value: { color: colors.plum, fontFamily: fonts.display, fontSize: 38, lineHeight: 42 },
  caption: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
});

export function RiskPill({ level }: { level: Level }) {
  const elevated = level === "Elevated";
  return (
    <View style={[pill.base, { backgroundColor: elevated ? "#f6dfe3" : "#deece5" }]}>
      <Text style={[pill.text, { color: elevated ? "#8d3e4d" : "#46715e" }]}>{level} indication</Text>
    </View>
  );
}

export function CompletePill({ text }: { text: string }) {
  return (
    <View style={[pill.base, { backgroundColor: "#e4f0e9", paddingVertical: 7, paddingHorizontal: 10 }]}>
      <Icon name="check" size={14} color="#4e7765" />
      <Text style={[pill.text, { color: "#4e7765" }]}>{text}</Text>
    </View>
  );
}

const pill = StyleSheet.create({
  base: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, alignSelf: "center" },
  text: { fontFamily: fonts.bold, fontSize: 11 },
});

export function Avatar({ name, onPress }: { name: string; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Account menu" onPress={onPress} style={av.circle}>
      <Text style={av.text}>{(name.trim()[0] ?? "E").toUpperCase()}</Text>
    </Pressable>
  );
}

const av = StyleSheet.create({
  circle: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.plum, alignItems: "center", justifyContent: "center" },
  text: { color: colors.white, fontFamily: fonts.bold, fontSize: 13 },
});

export type TabId = "dashboard" | "history" | "calendar";
const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "history", label: "History", icon: "history" },
  { id: "calendar", label: "Calendar", icon: "calendar" },
];

export function BottomNav({ active, onNavigate }: { active: TabId; onNavigate: (t: TabId) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityRole="tablist" style={[nav.bar, { paddingBottom: Math.max(12, insets.bottom) }]}>
      {TABS.map((t) => {
        const on = active === t.id;
        return (
          <Pressable key={t.id} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onNavigate(t.id)} style={[nav.tab, on && { backgroundColor: colors.lilac }]}>
            {on ? <View style={nav.indicator} /> : null}
            <Icon name={t.icon} size={20} color={on ? colors.plum : "#978c94"} />
            <Text style={[nav.label, { color: on ? colors.plum : "#978c94" }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const nav = StyleSheet.create({
  bar: {
    flexDirection: "row", gap: 4, paddingTop: 9, paddingHorizontal: 18,
    borderTopWidth: 1, borderTopColor: "rgba(218,207,215,0.86)", backgroundColor: "rgba(255,253,251,0.97)",
    shadowColor: "#4c2f40", shadowOpacity: 0.07, shadowRadius: 15, shadowOffset: { width: 0, height: -10 }, elevation: 12,
  },
  tab: { flex: 1, minHeight: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", gap: 4 },
  label: { fontFamily: fonts.bold, fontSize: 9 },
  indicator: { position: "absolute", top: -9, width: 24, height: 3, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, backgroundColor: colors.plum },
});
