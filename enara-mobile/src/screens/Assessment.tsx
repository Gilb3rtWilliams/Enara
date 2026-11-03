import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, predict } from "../api";
import { IconButton, ChoiceGroup, ErrorText, Eyebrow, H1, Lead, PrimaryButton, TextField } from "../components/ui";
import { Screen } from "../components/Screen";
import { ScoreSlider } from "../components/ScoreSlider";
import { useFlow } from "../flow";
import { useStore } from "../state/store";
import { colors, fonts } from "../theme";
import { Answers } from "../types";
import { Errors, NUMERIC, rangeNote, validateSection } from "../validation";

const SECTIONS = [
  { eyebrow: "Your cycle", title: "Tell us about your body", description: "These details help establish your baseline. Estimates are completely fine." },
  { eyebrow: "Your symptoms", title: "How have you been feeling?", description: "Rate each symptom based on your experience over the last three months." },
  { eyebrow: "Health history", title: "A little more context", description: "Your health history and wellbeing complete your Tier 1 assessment." },
];

export function Assessment({ onBack }: { onBack: () => void }) {
  const { flow, go, patch } = useFlow();
  const { data, update } = useStore();
  const insets = useSafeAreaInsets();
  const section = flow.section;
  const a = data.draft;
  const copy = SECTIONS[section];

  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    update((d) => ({ ...d, draft: { ...d.draft, [key]: value } }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const next = async () => {
    const errs = validateSection(section, a);
    setErrors(errs);
    if (Object.keys(errs).some((k) => errs[k])) return;
    if (section < 2) return patch({ section: section + 1 });

    setBusy(true);
    setApiError(null);
    try {
      const prediction = await predict(a);
      go("result", { pending: { prediction, answers: a, labs: null } });
    } catch (e) {
      setApiError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const numberField = (name: keyof typeof NUMERIC, label: string, placeholder: string, suffix?: string) => {
    const spec = NUMERIC[name];
    const value = String(a[spec.key]);
    return (
      <View style={{ flex: 1 }}>
        <TextField
          label={label}
          value={value}
          onChangeText={(t) => set(spec.key as any, t.replace(",", ".") as any)}
          placeholder={placeholder}
          suffix={suffix}
          keyboardType="decimal-pad"
          error={errors[name]}
        />
        {!errors[name] ? <Note text={rangeNote(value, spec.min, spec.max, spec.train)} /> : null}
      </View>
    );
  };

  return (
    <Screen
      header={
        <View style={[s.header, { paddingTop: insets.top, height: 68 + insets.top }]}>
          <IconButton icon="back" label="Go back" onPress={onBack} />
          <View style={s.track} accessibilityLabel={`Section ${section + 1} of 3`}>
            <View style={[s.fill, { width: `${[33, 66, 100][section]}%` }]} />
          </View>
          <Text style={s.progressLabel}>{section + 1}/3</Text>
        </View>
      }
      contentStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 }}
    >
      <View style={{ marginBottom: 30 }}>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <H1 style={{ marginBottom: 14 }}>{copy.title}</H1>
        <Lead>{copy.description}</Lead>
      </View>

      <View style={{ gap: 20 }}>
        {section === 0 && (
          <>
            {numberField("age", "Current age", "e.g. 29", "years")}
            {numberField("bmi", "Body mass index (BMI)", "e.g. 22.4")}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {numberField("cycleLength", "Cycle length", "28", "days")}
              {numberField("menarcheAge", "Age at first period", "12", "years")}
            </View>
          </>
        )}

        {section === 1 && (
          <>
            <View style={s.explainer}>
              <View style={s.bubble}><Text style={s.bubbleText}>0</Text></View>
              <Text style={s.explainerText}>Use the 0–10 scale for each symptom</Text>
              <View style={s.bubble}><Text style={s.bubbleText}>10</Text></View>
            </View>
            <ScoreSlider label="Period pain" hint="Dysmenorrhea" value={a.dysmenorrhea} onChange={(v) => set("dysmenorrhea", v)} />
            <ScoreSlider label="Pelvic pain" hint="Outside of your period" value={a.pelvicPain} onChange={(v) => set("pelvicPain", v)} />
            <ScoreSlider label="Pain during or after sex" hint="Dyspareunia" value={a.dyspareunia} onChange={(v) => set("dyspareunia", v)} />
            <ScoreSlider label="Painful bowel movements" hint="Dyschezia" value={a.dyschezia} onChange={(v) => set("dyschezia", v)} />
            <ScoreSlider label="Urinary symptoms" hint="Pain, urgency, or frequency" value={a.urinary} onChange={(v) => set("urinary", v)} />
          </>
        )}

        {section === 2 && (
          <>
            <ChoiceGroup label="Family history of endometriosis?" options={[{ label: "Yes", value: "Yes" as const }, { label: "No", value: "No" as const }]} value={a.familyHistory || null} onChange={(v) => set("familyHistory", v)} error={errors.familyHistory} />
            <ChoiceGroup label="Have you experienced infertility?" options={[{ label: "Yes", value: "Yes" as const }, { label: "No", value: "No" as const }]} value={a.infertility || null} onChange={(v) => set("infertility", v)} error={errors.infertility} />
            <ScoreSlider label="Mental wellbeing" hint="How supported and emotionally well do you feel?" value={a.mentalHealth} onChange={(v) => set("mentalHealth", v)} />
          </>
        )}

        {apiError ? <View style={s.banner}><ErrorText>{apiError}</ErrorText></View> : null}
        <PrimaryButton
          style={{ marginTop: 6 }}
          title={section === 2 ? (busy ? "Analysing…" : "View my result") : "Continue"}
          icon={section === 2 ? "spark" : "arrow"}
          onPress={next}
          disabled={busy}
        />
      </View>
    </Screen>
  );
}

function Note({ text }: { text: string | null }) {
  if (!text) return null;
  return <Text style={s.note}>{text}</Text>;
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: "rgba(231,223,229,0.78)", backgroundColor: "rgba(251,248,244,0.96)",
  },
  track: { flex: 1, height: 5, borderRadius: 10, backgroundColor: "#e5dce3", overflow: "hidden" },
  fill: { height: "100%", borderRadius: 10, backgroundColor: colors.plum },
  progressLabel: { color: colors.muted, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.6 },
  explainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 12, borderRadius: 13, backgroundColor: colors.lilac },
  bubble: { width: 25, height: 25, borderRadius: 13, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  bubbleText: { color: colors.plum, fontFamily: fonts.bold, fontSize: 11 },
  explainerText: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 11 },
  note: { marginTop: 6, color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  banner: { backgroundColor: colors.alertBg, borderRadius: 14, padding: 14 },
});
