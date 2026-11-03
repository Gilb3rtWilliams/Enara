import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glow } from "../components/Glow";
import { Icon } from "../components/Icon";
import { CompletePill, RiskPill, ScoreRing } from "../components/parts";
import { Screen } from "../components/Screen";
import { Brand, Eyebrow, H1, H2, PrimaryButton, SecondaryButton, TextButton } from "../components/ui";
import { useFlow } from "../flow";
import { levelOf, pct } from "../scoring";
import { recordFrom, shareSummary } from "../state/actions";
import { useStore } from "../state/store";
import { colors, fonts } from "../theme";

const URGENT = "If you have severe or sudden pain, heavy bleeding, fainting, or feel acutely unwell, seek urgent medical care.";

function TopRow({ pill }: { pill: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.topRow, { paddingTop: insets.top, height: 68 + insets.top }]}>
      <Brand compact />
      <CompletePill text={pill} />
    </View>
  );
}

/** Tier 1 result, straight from the model via POST /predict. */
export function Result() {
  const { flow, go } = useFlow();
  const { data, update } = useStore();
  const pending = flow.pending;
  if (!pending) return null;

  const { prediction: p } = pending;
  const elevated = p.tier1.elevated_risk;
  const level = levelOf(elevated);

  const save = () => {
    update((d) => ({ ...d, results: [recordFrom(pending), ...d.results] }));
    go("dashboard", { pending: null });
  };

  return (
    <Screen header={<TopRow pill="Complete" />} contentStyle={{ paddingBottom: 32 }}>
      <View style={s.hero}>
        <Glow cx={0.5} cy={0.35} r={0.32} alpha={0.88} />
        <Text style={s.kicker}>TIER 1 ASSESSMENT RESULT</Text>
        <ScoreRing p={p.tier1.probability} text={pct(p.tier1.probability)} label="pattern match" />
        <RiskPill level={level} />
        <Text style={s.heroTitle}>
          {elevated
            ? "Your responses show several patterns that can be associated with endometriosis."
            : "Your responses show fewer patterns commonly associated with endometriosis."}
        </Text>
        <Text style={s.heroText}>This result is a screening insight, not a diagnosis. Only a qualified clinician can diagnose endometriosis.</Text>
      </View>

      <View style={s.card}>
        {elevated ? (
          <>
            <Eyebrow>Tier 2 recommended</Eyebrow>
            <H2 style={s.cardTitle}>Discuss blood testing at a hospital</H2>
            <Text style={s.cardText}>
              Tier 2 adds two blood test values, CA-125 and CRP, to your symptom answers. Ask a healthcare professional whether these tests are appropriate for you, then add your results from your dashboard.
            </Text>
          </>
        ) : (
          <>
            <Eyebrow>Next step</Eyebrow>
            <H2 style={s.cardTitle}>No blood tests needed right now</H2>
            <Text style={s.cardText}>
              Your answers did not reach the model’s elevated-risk cutoff, so Tier 2 isn’t suggested. If your symptoms continue or get worse, speak to a healthcare professional and retake the assessment.
            </Text>
          </>
        )}
        <PrimaryButton title="Prepare doctor summary" icon="arrow" onPress={() => shareSummary({ ...pending, date: new Date().toISOString() }, data.profile?.name)} />
      </View>

      {p.warnings.length ? (
        <View style={[s.card, { marginTop: 0, backgroundColor: colors.lilac, borderColor: colors.lilac }]}>
          {p.warnings.map((w, i) => (
            <Text key={i} style={[s.cardText, { marginBottom: 0 }]}>{w}</Text>
          ))}
        </View>
      ) : null}

      <View style={{ marginHorizontal: 24, gap: 17 }}>
        <SecondaryButton title="Save result to dashboard" onPress={save} />
        <TextButton title="Retake assessment" style={{ alignSelf: "center" }} onPress={() => go("assessment", { section: 0, pending: null })} />
      </View>
      <Text style={s.urgent}>{URGENT}</Text>
    </Screen>
  );
}

/** Combined result after adding hospital blood-test values. */
export function FinalResult() {
  const { flow, go } = useFlow();
  const { data, update } = useStore();
  const pending = flow.pending;
  if (!pending || !pending.prediction.tier2) return null;

  const t1 = pending.prediction.tier1;
  const t2 = pending.prediction.tier2;
  const elevated = t2.elevated_risk;
  const level = levelOf(elevated);
  const labs = pending.labs;

  const save = () => {
    update((d) => ({ ...d, results: [recordFrom(pending), ...d.results] }));
    go("dashboard", { pending: null });
  };

  return (
    <Screen header={<TopRow pill="Both tiers complete" />} contentStyle={{ paddingBottom: 32 }}>
      <View style={[s.hero, { paddingTop: 38, paddingBottom: 34 }]}>
        <Glow cx={0.5} cy={0.28} r={0.31} alpha={0.76} />
        <Text style={s.kicker}>COMBINED ASSESSMENT</Text>
        <View style={s.finalScore}>
          <View style={s.finalInset} />
          <Text style={s.finalCaption}>Final pattern match</Text>
          <Text style={s.finalValue}>{pct(t2.probability)}</Text>
          <Text style={s.finalLevel}>{level} indication</Text>
        </View>
        <Text style={[s.heroTitle, { marginTop: 0, fontSize: 27 }]}>
          {elevated
            ? "Your combined results show a stronger pattern associated with endometriosis."
            : "Your combined results show fewer patterns commonly associated with endometriosis."}
        </Text>
        <Text style={[s.heroText, { color: colors.muted, fontSize: 12 }]}>
          This re-scores your symptom answers together with the CA-125 and CRP values from your hospital report.
        </Text>
      </View>

      <View style={{ margin: 24, gap: 10 }}>
        <View style={s.summaryCard}>
          <View style={s.num}><Text style={s.numText}>1</Text></View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.smallCaps}>Tier 1</Text>
            <Text style={s.summaryStrong}>{pct(t1.probability)} match</Text>
            <Text style={s.summaryP}>Symptoms and health history</Text>
          </View>
          <Icon name="check" size={17} color="#47715e" />
        </View>
        <View style={s.summaryCard}>
          <View style={s.num}><Text style={s.numText}>2</Text></View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.smallCaps}>Tier 2</Text>
            <Text style={s.summaryStrong}>Results included</Text>
            <Text style={s.summaryP}>CA-125: {labs?.ca125} U/mL · CRP: {labs?.crp} mg/L</Text>
          </View>
          <Icon name="check" size={17} color="#47715e" />
        </View>
      </View>

      <View style={s.guidance}>
        <View style={s.guidanceIcon}><Icon name="shield" size={22} color={colors.plum} /></View>
        <View style={{ flex: 1 }}>
          <Eyebrow style={{ marginBottom: 5 }}>What this means</Eyebrow>
          <H2 style={{ fontSize: 19, lineHeight: 23, marginBottom: 8 }}>Review this result with your clinician</H2>
          <Text style={s.guidanceText}>
            Neither this result nor these blood markers can confirm endometriosis. A clinician may recommend examination, imaging, or other investigations based on your individual circumstances.
          </Text>
        </View>
      </View>

      <View style={{ marginHorizontal: 24, gap: 11 }}>
        <PrimaryButton title="Save final result" icon="arrow" onPress={save} />
        <SecondaryButton title="Prepare doctor summary" onPress={() => shareSummary({ ...pending, date: new Date().toISOString() }, data.profile?.name)} />
      </View>
      <Text style={s.urgent}>{URGENT}</Text>
    </Screen>
  );
}

const s = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, backgroundColor: colors.cream },
  hero: { paddingTop: 36, paddingBottom: 30, paddingHorizontal: 24, alignItems: "center", backgroundColor: "#e4d7e1", borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: "hidden" },
  kicker: { color: colors.plum, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.2 },
  heroTitle: { marginTop: 20, marginBottom: 12, maxWidth: 400, textAlign: "center", color: colors.ink, fontFamily: fonts.display, fontSize: 26, lineHeight: 31 },
  heroText: { maxWidth: 430, textAlign: "center", color: "#756b73", fontFamily: fonts.body, fontSize: 13, lineHeight: 21 },
  card: { margin: 24, padding: 22, borderWidth: 1, borderColor: colors.line, borderRadius: 20, backgroundColor: colors.white },
  cardTitle: { fontSize: 22, lineHeight: 27, marginBottom: 9 },
  cardText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 21, marginBottom: 19 },
  urgent: { marginTop: 24, marginHorizontal: 30, textAlign: "center", color: "#91878f", fontFamily: fonts.body, fontSize: 10, lineHeight: 15 },

  finalScore: {
    width: 172, height: 172, borderRadius: 86, marginTop: 25, marginBottom: 22, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(103,54,81,0.12)", backgroundColor: "rgba(255,255,255,0.72)",
    shadowColor: colors.plumDark, shadowOpacity: 0.12, shadowRadius: 17, shadowOffset: { width: 0, height: 18 }, elevation: 6,
  },
  finalInset: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 86, borderWidth: 9, borderColor: "rgba(103,54,81,0.06)" },
  finalCaption: { color: colors.muted, fontFamily: fonts.body, fontSize: 10 },
  finalValue: { marginVertical: 4, color: colors.plum, fontFamily: fonts.display, fontSize: 43, lineHeight: 46 },
  finalLevel: { color: colors.rose, fontFamily: fonts.bold, fontSize: 10 },

  summaryCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderWidth: 1, borderColor: colors.line, borderRadius: 17, backgroundColor: colors.white },
  num: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.lilac, alignItems: "center", justifyContent: "center" },
  numText: { color: colors.plum, fontFamily: fonts.bold, fontSize: 12 },
  smallCaps: { color: "#978c94", fontFamily: fonts.bold, fontSize: 9, textTransform: "uppercase" },
  summaryStrong: { color: "#514650", fontFamily: fonts.bold, fontSize: 13 },
  summaryP: { color: "#958a92", fontFamily: fonts.body, fontSize: 9 },

  guidance: { flexDirection: "row", alignItems: "flex-start", gap: 14, margin: 24, padding: 20, borderRadius: 19, backgroundColor: colors.lilac },
  guidanceIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  guidanceText: { color: "#716670", fontFamily: fonts.body, fontSize: 11, lineHeight: 17 },
});
