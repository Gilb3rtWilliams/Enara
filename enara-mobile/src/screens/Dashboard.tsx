import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glow } from "../components/Glow";
import { Icon } from "../components/Icon";
import { Avatar, BottomNav, TabId } from "../components/parts";
import { Screen } from "../components/Screen";
import { Brand, Eyebrow, H1, H2, PrimaryButton, TextButton } from "../components/ui";
import { completedLabel, greeting } from "../dates";
import { choose } from "../dialog";
import { useFlow } from "../flow";
import { headline, pct } from "../scoring";
import { useStore } from "../state/store";
import { colors, fonts } from "../theme";

export const PAGE_BG = "#f8f4f1";

export function AccountMenu() {
  const { go } = useFlow();
  const { data, update, wipe } = useStore();
  return () =>
    choose("Your account", data.profile?.email ?? "", [
      { text: "Sign out", onPress: () => { update((d) => ({ ...d, signedIn: false })); go("welcome"); } },
      {
        text: "Delete my data",
        style: "destructive",
        onPress: () =>
          choose("Delete everything?", "This removes your account, results and cycle log from this device. It can’t be undone.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => { await wipe(); go("welcome"); } },
          ]),
      },
      { text: "Cancel", style: "cancel" },
    ]);
}

export function Dashboard({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const { go } = useFlow();
  const { data } = useStore();
  const insets = useSafeAreaInsets();
  const openMenu = AccountMenu();
  const name = data.profile?.name ?? "";
  const rec = data.results[0];

  const symptoms = rec
    ? ([["Period pain", rec.answers.dysmenorrhea], ["Pelvic pain", rec.answers.pelvicPain], ["Pain during sex", rec.answers.dyspareunia], ["Bowel pain", rec.answers.dyschezia], ["Urinary", rec.answers.urinary]] as const)
    : [];

  const h = rec ? headline(rec.prediction) : null;
  const canAddLabs = !!rec && !rec.prediction.tier2 && rec.prediction.tier1.elevated_risk;

  return (
    <View style={{ flex: 1, backgroundColor: PAGE_BG }}>
      <Screen
        header={
          <View style={[s.header, { paddingTop: insets.top, height: 68 + insets.top }]}>
            <Brand compact />
            <Avatar name={name} onPress={openMenu} />
          </View>
        }
        contentStyle={{ paddingBottom: 118 + insets.bottom, backgroundColor: PAGE_BG }}
      >
        <View style={s.intro}>
          <Eyebrow>Your health overview</Eyebrow>
          <H1 style={s.title}>{greeting()}{name ? `, ${name}` : ""}</H1>
          <Text style={s.introText}>{rec ? "Your assessment is saved privately on this device." : "Take your first assessment to see your overview."}</Text>
        </View>

        {rec && h ? (
          <View style={s.resultCard}>
            <Glow cx={0.95} cy={0.05} r={0.38} alpha={0.17} />
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={s.kicker}>{h.combined ? "LATEST COMBINED RESULT" : "LATEST TIER 1 RESULT"}</Text>
              <Text style={s.resultLevel}>{h.level} indication</Text>
              <Text style={s.resultSmall}>{completedLabel(rec.date)}</Text>
            </View>
            <View style={s.mini}>
              <Text style={s.miniValue}>{pct(h.probability)}</Text>
              <Text style={s.miniLabel}>match</Text>
            </View>
          </View>
        ) : (
          <View style={[s.section, { gap: 16 }]}>
            <H2 style={{ fontSize: 21 }}>No assessments yet</H2>
            <Text style={s.p}>The assessment takes about four minutes and nothing leaves your phone except the answers needed to calculate your result.</Text>
            <PrimaryButton title="Start assessment" icon="arrow" onPress={() => go("assessment", { section: 0 })} />
          </View>
        )}

        {rec ? (
          <>
            <View style={s.section}>
              <View style={s.heading}>
                <View>
                  <Eyebrow style={{ marginBottom: 4 }}>Testing pathway</Eyebrow>
                  <H2 style={s.h2}>Your next step</H2>
                </View>
                <View style={s.stepCount}><Text style={s.stepCountText}>{rec.prediction.tier2 ? "2 of 2" : "1 of 2"}</Text></View>
              </View>
              <View style={{ gap: 18, marginBottom: 20 }}>
                <TierRow done title="Tier 1 · Health assessment" sub="Symptoms, cycle, history and wellbeing" />
                <TierRow done={!!rec.prediction.tier2} n="2" title="Tier 2 · Hospital blood tests" sub="Adds CA-125 and CRP results" />
              </View>
              {rec.prediction.tier2 && rec.labs ? (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={s.lab}><Text style={s.labSpan}>CA-125</Text><Text style={s.labStrong}>{rec.labs.ca125} U/mL</Text></View>
                  <View style={s.lab}><Text style={s.labSpan}>CRP</Text><Text style={s.labStrong}>{rec.labs.crp} mg/L</Text></View>
                </View>
              ) : canAddLabs ? (
                <PrimaryButton title="Add hospital test results" icon="arrow" onPress={() => go("tier2")} />
              ) : (
                <Text style={s.p}>Tier 2 isn’t suggested because your Tier 1 result was lower. Retake the assessment if your symptoms change.</Text>
              )}
            </View>

            <View style={s.section}>
              <View style={s.heading}>
                <View>
                  <Eyebrow style={{ marginBottom: 4 }}>Your data</Eyebrow>
                  <H2 style={s.h2}>Symptom snapshot</H2>
                </View>
                <Text style={s.caption}>out of 10</Text>
              </View>
              <View style={{ gap: 14 }}>
                {symptoms.map(([label, value]) => (
                  <View key={label} style={s.symRow}>
                    <Text style={s.symLabel}>{label}</Text>
                    <View style={s.symTrack}><View style={[s.symFill, { width: `${value * 10}%` }]} /></View>
                    <Text style={s.symValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={s.section}>
              <Eyebrow style={{ marginBottom: 14 }}>Health details</Eyebrow>
              <View style={s.grid}>
                <Detail label="Age" value={rec.answers.age || "—"} />
                <Detail label="BMI" value={rec.answers.bmi || "—"} />
                <Detail label="Cycle" value={`${rec.answers.cycleLength || "—"} days`} />
                <Detail label="First period" value={`Age ${rec.answers.menarcheAge || "—"}`} />
              </View>
            </View>

            <TextButton title="Retake Tier 1 assessment" style={{ alignSelf: "center", marginTop: 25 }} textStyle={{ fontSize: 12 }} onPress={() => go("assessment", { section: 0 })} />
          </>
        ) : null}
      </Screen>
      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </View>
  );
}

function TierRow({ done, n, title, sub }: { done?: boolean; n?: string; title: string; sub: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
      <View style={[s.status, done && { borderColor: "transparent", backgroundColor: "#deece5" }]}>
        {done ? <Icon name="check" size={16} color="#46715e" /> : <Text style={s.statusText}>{n}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowSub}>{sub}</Text>
      </View>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.detail}>
      <Text style={s.labSpan}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );
}

export const common = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: "rgba(231,223,229,0.75)", backgroundColor: "rgba(248,244,241,0.96)" },
});

const s = StyleSheet.create({
  header: common.header,
  intro: { paddingTop: 30, paddingHorizontal: 24, paddingBottom: 22 },
  title: { fontSize: 30, lineHeight: 34.5, letterSpacing: -0.5, marginBottom: 7 },
  introText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  resultCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 18, marginHorizontal: 24, marginBottom: 18, padding: 21, borderRadius: 21,
    backgroundColor: colors.plum, overflow: "hidden", shadowColor: colors.plum, shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: { width: 0, height: 14 }, elevation: 8,
  },
  kicker: { color: "#dccbd5", fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.8 },
  resultLevel: { color: colors.white, fontFamily: fonts.display, fontSize: 21 },
  resultSmall: { color: "#d3c2cc", fontFamily: fonts.body, fontSize: 10 },
  mini: { width: 68, height: 68, borderRadius: 34, borderWidth: 1, borderColor: "rgba(255,255,255,0.24)", backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  miniValue: { color: colors.white, fontFamily: fonts.bold, fontSize: 18 },
  miniLabel: { color: "#d9cbd3", fontFamily: fonts.body, fontSize: 9 },
  section: { marginVertical: 9, marginHorizontal: 24, padding: 20, borderWidth: 1, borderColor: colors.line, borderRadius: 20, backgroundColor: colors.white },
  heading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 15, marginBottom: 18 },
  h2: { fontSize: 21, lineHeight: 25 },
  stepCount: { paddingVertical: 6, paddingHorizontal: 9, borderRadius: 999, backgroundColor: colors.lilac },
  stepCountText: { color: "#958a92", fontFamily: fonts.bold, fontSize: 10 },
  caption: { color: "#958a92", fontFamily: fonts.bold, fontSize: 10 },
  p: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20 },
  status: { width: 29, height: 29, borderRadius: 15, borderWidth: 1, borderColor: "#d8ccd4", alignItems: "center", justifyContent: "center" },
  statusText: { color: "#9a8e97", fontFamily: fonts.bold, fontSize: 11 },
  rowTitle: { color: "#514650", fontFamily: fonts.bold, fontSize: 13 },
  rowSub: { marginTop: 4, color: "#968b94", fontFamily: fonts.body, fontSize: 10 },
  lab: { flex: 1, gap: 4, padding: 14, borderRadius: 14, backgroundColor: colors.lilac },
  labSpan: { color: "#8f838c", fontFamily: fonts.body, fontSize: 10 },
  labStrong: { color: colors.plum, fontFamily: fonts.bold, fontSize: 14 },
  symRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  symLabel: { width: 92, color: "#70656e", fontFamily: fonts.body, fontSize: 10 },
  symTrack: { flex: 1, height: 6, borderRadius: 8, backgroundColor: "#eee8ec", overflow: "hidden" },
  symFill: { height: "100%", borderRadius: 8, backgroundColor: colors.rose },
  symValue: { width: 18, textAlign: "right", color: colors.plum, fontFamily: fonts.bold, fontSize: 11 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  detail: { width: "48%", flexGrow: 1, gap: 4, padding: 13, borderRadius: 13, backgroundColor: "#faf7f8" },
  detailValue: { color: "#564a53", fontFamily: fonts.bold, fontSize: 13 },
});
