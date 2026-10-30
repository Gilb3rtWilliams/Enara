import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ApiError, predict } from "../api";
import { Icon } from "../components/Icon";
import { Screen } from "../components/Screen";
import { ErrorText, PrimaryButton, TextField, TitleBlock, TopBar } from "../components/ui";
import { useFlow } from "../flow";
import { useStore } from "../state/store";
import { colors, fonts } from "../theme";
import { Labs } from "../types";
import { Errors, LAB_SPEC, rangeNote, validateLabs } from "../validation";

export function TierTwo() {
  const { go } = useFlow();
  const { data } = useStore();
  const base = data.results[0]; // the saved Tier 1 assessment these results belong to
  const [labs, setLabs] = useState<Labs>({ ca125: "", crp: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (k: keyof Labs, v: string) => {
    setLabs((l) => ({ ...l, [k]: v.replace(",", ".") }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async () => {
    const errs = validateLabs(labs);
    setErrors(errs);
    if (Object.keys(errs).some((k) => errs[k]) || !base) return;
    setBusy(true);
    setApiError(null);
    try {
      const prediction = await predict(base.answers, labs);
      if (!prediction.tier2) {
        setApiError("The Tier 2 result couldn’t be calculated for these answers. Please try again.");
        return;
      }
      go("finalResult", { pending: { prediction, answers: base.answers, labs } });
    } catch (e) {
      setApiError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const note = (k: keyof Labs) => {
    const spec = LAB_SPEC[k];
    const text = errors[k] ? null : rangeNote(labs[k], spec.min, spec.max, spec.train);
    return text ? <Text style={s.note}>{text}</Text> : null;
  };

  return (
    <Screen header={<TopBar onBack={() => go("dashboard")} step="Tier 2" />} contentStyle={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 40 }}>
      <View style={s.badge}><Text style={s.badgeText}>Hospital blood tests</Text></View>
      <TitleBlock eyebrow="Clinical follow-up" title="Add your Tier 2 results">
        Enter results only from a hospital or accredited laboratory report. These biomarkers should be interpreted by a healthcare professional.
      </TitleBlock>
      <View style={{ gap: 19 }}>
        <View>
          <TextField label="CA-125 level" value={labs.ca125} onChangeText={(v) => set("ca125", v)} placeholder="e.g. 24" suffix="U/mL" keyboardType="decimal-pad" error={errors.ca125} />
          {note("ca125")}
        </View>
        <View>
          <TextField label="CRP level" value={labs.crp} onChangeText={(v) => set("crp", v)} placeholder="e.g. 3.1" suffix="mg/L" keyboardType="decimal-pad" error={errors.crp} />
          {note("crp")}
        </View>
        <View style={s.clinical}>
          <Icon name="shield" size={20} color={colors.plum} />
          <Text style={s.clinicalText}>CA-125 and CRP cannot diagnose endometriosis on their own. Enara uses them only as supporting clinical context.</Text>
        </View>
        {apiError ? <View style={s.banner}><ErrorText>{apiError}</ErrorText></View> : null}
        <PrimaryButton title={busy ? "Calculating…" : "Save hospital results"} icon="check" onPress={submit} disabled={busy} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  badge: { alignSelf: "flex-start", marginBottom: 18, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 999, backgroundColor: colors.lilac },
  badgeText: { color: colors.plum, fontFamily: fonts.bold, fontSize: 11 },
  clinical: { flexDirection: "row", alignItems: "flex-start", gap: 11, padding: 15, borderRadius: 15, backgroundColor: colors.lilac },
  clinicalText: { flex: 1, color: "#685d66", fontFamily: fonts.body, fontSize: 11, lineHeight: 17 },
  note: { marginTop: 6, color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  banner: { backgroundColor: colors.alertBg, borderRadius: 14, padding: 14 },
});
