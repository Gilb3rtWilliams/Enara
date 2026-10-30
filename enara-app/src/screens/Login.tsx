import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { ErrorText, PrimaryButton, TextButton, TextField, TitleBlock, TopBar } from "../components/ui";
import { hashPassword } from "../auth";
import { useFlow } from "../flow";
import { useStore } from "../state/store";
import { colors, fonts } from "../theme";

export function Login() {
  const { go } = useFlow();
  const { data, update } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    const profile = data.profile;
    if (!profile) return setError("There’s no account on this device yet. Create one to get started.");
    setBusy(true);
    try {
      const hash = await hashPassword(password, profile.salt);
      if (email.trim().toLowerCase() !== profile.email || hash !== profile.passHash) {
        return setError("That email and password don’t match the account on this device.");
      }
      update((d) => ({ ...d, signedIn: true }));
      go(data.results.length ? "dashboard" : "assessment", { section: 0 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen header={<TopBar onBack={() => go("welcome")} />} contentStyle={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 40 }}>
      <TitleBlock eyebrow="Welcome back" title="Sign in to Enara">Continue your private health assessment.</TitleBlock>
      <View style={{ gap: 19 }}>
        <TextField label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" icon="mail" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" icon="lock" secureTextEntry autoCapitalize="none" autoComplete="password" />
        <TextButton
          title="Forgot password?"
          style={{ alignSelf: "flex-end", marginTop: -8 }}
          textStyle={{ fontSize: 13 }}
          onPress={() => Alert.alert("Password reset isn’t available yet", "Your Enara account is stored on this device only, so it can’t be reset by email. You can delete your data from the profile menu and create a new account.")}
        />
        <ErrorText>{error}</ErrorText>
        <PrimaryButton title={busy ? "Signing in…" : "Sign in"} icon="arrow" onPress={submit} disabled={busy} />
      </View>
      <View style={{ flex: 1, minHeight: 30 }} />
      <Text style={{ textAlign: "center", color: colors.muted, fontFamily: fonts.body, fontSize: 14 }}>
        New to Enara? <Text onPress={() => go("signup")} style={{ color: colors.plum, fontFamily: fonts.bold }}>Create account</Text>
      </Text>
    </Screen>
  );
}
