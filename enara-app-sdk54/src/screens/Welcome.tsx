import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glow } from "../components/Glow";
import { Icon } from "../components/Icon";
import { Eyebrow, H1, Lead, PrimaryButton, SecondaryButton } from "../components/ui";
import { useFlow } from "../flow";
import { colors, fonts } from "../theme";

export function Welcome() {
  const { go } = useFlow();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={[s.visual, { height: Math.max(300, height * 0.43) }]}>
        <Glow cx={0.7} cy={0.35} r={0.2} alpha={0.68} />
        <LinearGradient colors={["rgba(112,61,89,0.18)", "rgba(112,61,89,0)"]} locations={[0, 0.55]} start={{ x: 0.25, y: 0 }} end={{ x: 0.75, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={[s.orbit, { width: 360, height: 360, left: -170, top: -80, borderRadius: 180 }]} />
        <View style={[s.orbit, { width: 280, height: 280, right: -130, bottom: -100, borderRadius: 140 }]} />
        <View style={[s.petal, { width: 150, height: 210, right: -20, top: -30, transform: [{ rotate: "35deg" }], borderTopLeftRadius: 105, borderTopRightRadius: 45, borderBottomRightRadius: 98, borderBottomLeftRadius: 52 }]} />
        <View style={[s.petal, { width: 120, height: 170, left: -20, bottom: -60, transform: [{ rotate: "-30deg" }], borderTopLeftRadius: 84, borderTopRightRadius: 36, borderBottomRightRadius: 78, borderBottomLeftRadius: 42 }]} />
        <View style={[s.petal, { width: 80, height: 120, right: "30%", bottom: -55, transform: [{ rotate: "75deg" }], borderTopLeftRadius: 56, borderTopRightRadius: 24, borderBottomRightRadius: 52, borderBottomLeftRadius: 28 }]} />
        <View style={[s.brandRow, { paddingTop: insets.top }]}>
          <View style={s.mark}>
            <Icon name="flower" size={34} color={colors.white} />
          </View>
          <Text style={s.brandText}>Enara</Text>
        </View>
      </View>

      <View style={[s.content, { paddingBottom: 28 + insets.bottom }]}>
        <Eyebrow>Understand your symptoms</Eyebrow>
        <H1 style={{ marginBottom: 14 }}>Clarity starts with listening to your body.</H1>
        <Lead>A private, guided assessment to help you better understand your endometriosis risk.</Lead>

        <View style={{ flex: 1, minHeight: 24 }} />
        <View style={{ gap: 11 }}>
          <PrimaryButton title="Sign in" icon="arrow" onPress={() => go("login")} />
          <SecondaryButton title="Create an account" onPress={() => go("signup")} />
        </View>
        <View style={s.privacy}>
          <Icon name="shield" size={15} color={colors.faint} />
          <Text style={s.privacyText}>Your health information stays private</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  visual: { backgroundColor: colors.welcomeBg, overflow: "hidden" },
  orbit: { position: "absolute", borderWidth: 1, borderColor: "rgba(255,255,255,0.5)" },
  petal: { position: "absolute", backgroundColor: "rgba(255,250,252,0.52)" },
  brandRow: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  mark: {
    width: 56, height: 56, borderRadius: 19, backgroundColor: colors.plum, alignItems: "center", justifyContent: "center",
    shadowColor: colors.plumDark, shadowOpacity: 0.2, shadowRadius: 13, shadowOffset: { width: 0, height: 12 }, elevation: 6,
  },
  brandText: { color: colors.plumDark, fontFamily: fonts.display, fontSize: 32 },
  content: { flex: 1, paddingTop: 34, paddingHorizontal: 24 },
  privacy: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 20 },
  privacyText: { color: colors.faint, fontFamily: fonts.body, fontSize: 12 },
});
