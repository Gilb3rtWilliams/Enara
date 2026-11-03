import React, { useState } from "react";
import { Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Checkbox, ErrorText, PrimaryButton, TextField, TitleBlock, TopBar } from "../components/ui";
import { useFlow } from "../flow";
import { colors, fonts } from "../theme";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Signup() {
  const { go } = useFlow();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; agree?: string }>({});

  const submit = () => {
    const e: typeof errors = {};
    if (!EMAIL.test(email.trim())) e.email = "Enter a valid email address.";
    if (password.length < 8) e.password = "Use at least 8 characters.";
    if (!agree) e.agree = "Please agree to continue.";
    setErrors(e);
    if (Object.keys(e).length === 0) go("profile", { signup: { email: email.trim().toLowerCase(), password } });
  };

  const link = { color: colors.plum, fontFamily: fonts.bold };
  return (
    <Screen header={<TopBar onBack={() => go("welcome")} step="Step 1 of 2" />} contentStyle={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 40 }}>
      <TitleBlock eyebrow="Your account" title="Let’s get you started">Create a secure account to save your progress and results.</TitleBlock>
      <View style={{ gap: 19 }}>
        <TextField label="Email address" value={email} onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }} placeholder="you@example.com" icon="mail" keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email} />
        <TextField label="Create password" value={password} onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }} placeholder="At least 8 characters" icon="lock" secureTextEntry autoCapitalize="none" autoComplete="new-password" error={errors.password} />
        <View>
          <Checkbox checked={agree} onChange={(v) => { setAgree(v); setErrors((e) => ({ ...e, agree: undefined })); }}>
            I agree to the <Text style={link}>Terms</Text> and <Text style={link}>Privacy Policy</Text>.
          </Checkbox>
          <ErrorText>{errors.agree}</ErrorText>
        </View>
        <PrimaryButton title="Continue" icon="arrow" onPress={submit} />
      </View>
      <View style={{ flex: 1, minHeight: 30 }} />
      <Text style={{ textAlign: "center", color: colors.muted, fontFamily: fonts.body, fontSize: 14 }}>
        Already have an account? <Text onPress={() => go("login")} style={link}>Sign in</Text>
      </Text>
    </Screen>
  );
}
