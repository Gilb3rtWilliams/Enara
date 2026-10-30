import Slider from "@react-native-community/slider";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";

export function ScoreSlider({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={s.card}>
      <View style={s.heading}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>{label}</Text>
          <Text style={s.hint}>{hint}</Text>
        </View>
        <View style={s.output} accessibilityLabel={`${label} score`}>
          <Text style={s.outputText}>{value}</Text>
        </View>
      </View>
      <Slider
        accessibilityLabel={label}
        style={s.slider}
        minimumValue={0}
        maximumValue={10}
        step={1}
        value={value}
        onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={colors.plum}
        maximumTrackTintColor="#e5dce3"
        thumbTintColor={colors.plum}
      />
      <View style={s.ends}>
        <Text style={s.endText}>None</Text>
        <Text style={s.endText}>Severe</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: 17, borderWidth: 1, borderColor: colors.line, borderRadius: 17, backgroundColor: colors.white },
  heading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  label: { color: colors.label, fontFamily: fonts.bold, fontSize: 13, marginBottom: 3 },
  hint: { color: "#968c94", fontFamily: fonts.body, fontSize: 11 },
  output: { width: 37, height: 37, borderRadius: 12, backgroundColor: colors.lilac, alignItems: "center", justifyContent: "center" },
  outputText: { color: colors.plum, fontFamily: fonts.bold, fontSize: 16 },
  slider: { width: "100%", height: 40, marginTop: 8, marginBottom: 0 },
  ends: { flexDirection: "row", justifyContent: "space-between" },
  endText: { color: "#aaa0a8", fontFamily: fonts.body, fontSize: 10 },
});
