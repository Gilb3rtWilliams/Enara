import React, { useState } from "react";
import { Text, View } from "react-native";
import { Icon } from "../components/Icon";
import { Screen } from "../components/Screen";
import { ChoiceGroup, PrimaryButton, TextField, TitleBlock, TopBar } from "../components/ui";
import { hashPassword, newSalt } from "../auth";
import { useFlow } from "../flow";
import { useStore } from "../state/store";
import { ageFromDob } from "../validation";
import { colors, fonts } from "../theme";

/** "12031996" -> "12/03/1996" while typing */
const maskDob = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/");
};

/** DD/MM/YYYY -> YYYY-MM-DD, or null if it isn't a real date */
export function parseDob(text: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!m) return null;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function Profile() {
  const { flow, go } = useFlow();
  const { update } = useStore();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<"female" | "intersex" | null>(null);
  const [errors, setErrors] = useState<{ name?: string; dob?: string; sex?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const e: typeof errors = {};
    const iso = parseDob(dob);
    const age = iso ? ageFromDob(iso) : null;
    if (!name.trim()) e.name = "Tell us what to call you.";
    if (!iso || age === null) e.dob = "Enter a valid date, like 27/03/1996.";
    else if (age < 10 || age > 70) e.dob = "This assessment is designed for ages 10 to 70.";
    if (!sex) e.sex = "Please choose an option.";
    setErrors(e);
    if (Object.keys(e).length || !flow.signup || !iso || !sex) return;

    setBusy(true);
    try {
      const salt = await newSalt();
      const passHash = await hashPassword(flow.signup.password, salt);
      update((d) => ({
        ...d,
        signedIn: true,
        profile: { email: flow.signup!.email, name: name.trim(), dob: iso, sex, salt, passHash },
        draft: { ...d.draft, age: d.draft.age || (age !== null ? String(age) : "") },
      }));
      go("assessment", { section: 0, signup: null });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen header={<TopBar onBack={() => go("signup")} step="Step 2 of 2" />} contentStyle={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 40 }}>
      <View style={{ width: 52, height: 52, borderRadius: 17, backgroundColor: colors.lilac, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <Icon name="user" size={25} color={colors.plum} />
      </View>
      <TitleBlock eyebrow="Your profile" title="What should we call you?">A few details to make your experience feel more personal.</TitleBlock>
      <View style={{ gap: 19 }}>
        <TextField label="Preferred name" value={name} onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }} placeholder="e.g. Maya" icon="user" autoCapitalize="words" autoComplete="name" error={errors.name} />
        <TextField label="Date of birth" value={dob} onChangeText={(t) => { setDob(maskDob(t)); setErrors((e) => ({ ...e, dob: undefined })); }} placeholder="DD/MM/YYYY" icon="calendar" keyboardType="number-pad" error={errors.dob} />
        <ChoiceGroup
          label="Sex assigned at birth"
          options={[{ label: "Female", value: "female" as const }, { label: "Intersex", value: "intersex" as const }]}
          value={sex}
          onChange={(v) => { setSex(v); setErrors((e) => ({ ...e, sex: undefined })); }}
          error={errors.sex}
        />
        <PrimaryButton title={busy ? "Setting up…" : "Start assessment"} icon="arrow" onPress={submit} disabled={busy} />
      </View>
      <Text style={{ marginTop: 18, textAlign: "center", color: colors.faintest, fontFamily: fonts.body, fontSize: 12 }}>
        This takes about 4 minutes. You can pause at any time.
      </Text>
    </Screen>
  );
}
