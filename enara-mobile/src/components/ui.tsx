import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, shadow } from "../theme";
import { Icon, IconName } from "./Icon";

/* ---------- text ---------- */

export function Eyebrow({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.eyebrow, style]}>{String(children).toUpperCase()}</Text>;
}

/** Fraunces heading; size follows the design's clamp(31px, 9vw, 42px). */
export function H1({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const { width } = useWindowDimensions();
  const size = Math.min(42, Math.max(31, width * 0.09));
  return (
    <Text accessibilityRole="header" style={[s.h1, { fontSize: size, lineHeight: size * 1.08, letterSpacing: -size * 0.025 }, style]}>
      {children}
    </Text>
  );
}

export function H2({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text accessibilityRole="header" style={[s.h2, style]}>
      {children}
    </Text>
  );
}

export function Lead({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.lead, style]}>{children}</Text>;
}

export function TitleBlock({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <View style={s.titleBlock}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <H1 style={{ marginBottom: 14 }}>{title}</H1>
      {children ? <Lead>{children}</Lead> : null}
    </View>
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <Text accessibilityRole="alert" style={s.error}>
      {children}
    </Text>
  );
}

/* ---------- brand + bars ---------- */

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={s.brand}>
      <View style={s.brandMark}>
        <Icon name="flower" size={compact ? 18 : 23} color={colors.white} />
      </View>
      <Text style={[s.brandName, compact && { fontSize: 19 }]}>Enara</Text>
    </View>
  );
}

export function TopBar({ onBack, step }: { onBack: () => void; step?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.topbar, { paddingTop: insets.top, height: 68 + insets.top }]}>
      <IconButton icon="back" label="Go back" onPress={onBack} />
      {step ? <Text style={s.topbarStep}>{step}</Text> : <Brand compact />}
      <View style={{ width: 40 }} />
    </View>
  );
}

export function IconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [s.iconButton, pressed && { backgroundColor: colors.lilac }]}
    >
      <Icon name={icon} size={20} color={colors.ink} />
    </Pressable>
  );
}

/* ---------- buttons ---------- */

type ButtonProps = {
  title: string;
  onPress?: () => void;
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ title, onPress, icon, disabled, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.primary,
        shadow(),
        pressed && { backgroundColor: colors.plumDark, transform: [{ translateY: 1 }] },
        disabled && { opacity: 0.6 },
        style,
      ]}
    >
      <Text style={s.primaryText}>{title}</Text>
      {icon ? <Icon name={icon} size={19} color={colors.white} /> : null}
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress, disabled, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.secondary, pressed && { backgroundColor: colors.white }, disabled && { opacity: 0.6 }, style]}
    >
      <Text style={s.secondaryText}>{title}</Text>
    </Pressable>
  );
}

export function TextButton({ title, onPress, style, textStyle }: { title: string; onPress?: () => void; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={style}>
      <Text style={[s.textButton, textStyle]}>{title}</Text>
    </Pressable>
  );
}

/* ---------- inputs ---------- */

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  icon?: IconName;
  suffix?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words";
  autoComplete?: "email" | "password" | "new-password" | "name" | "off";
  error?: string | null;
  style?: StyleProp<ViewStyle>;
};

export function TextField({ label, value, onChangeText, placeholder, icon, suffix, keyboardType, secureTextEntry, autoCapitalize, autoComplete, error, style }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ minWidth: 0 }, style]}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View>
        {icon ? (
          <View style={[s.inputIcon, { left: 15 }]} pointerEvents="none">
            <Icon name={icon} size={19} color={colors.iconGray} />
          </View>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            s.input,
            icon ? { paddingLeft: 46 } : null,
            suffix ? { paddingRight: 70 } : null,
            focused && s.inputFocused,
            error ? { borderColor: colors.alertText } : null,
          ]}
        />
        {suffix ? (
          <View style={[s.inputIcon, { right: 15 }]} pointerEvents="none">
            <Text style={s.suffix}>{suffix}</Text>
          </View>
        ) : null}
      </View>
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

/** Two big tap targets (design's .choice-grid). */
export function ChoiceGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T | null;
  onChange: (v: T) => void;
  error?: string | null;
}) {
  return (
    <View accessibilityRole="radiogroup">
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.choiceGrid}>
        {options.map((o) => {
          const on = value === o.value;
          return (
            <Pressable
              key={String(o.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => onChange(o.value)}
              style={[s.choice, on && s.choiceOn]}
            >
              <Text style={[s.choiceText, on && { color: colors.plum }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => onChange(!checked)} style={s.consentRow}>
      <View style={[s.checkbox, checked && { backgroundColor: colors.plum, borderColor: colors.plum }]}>
        {checked ? <Icon name="check" size={13} color={colors.white} /> : null}
      </View>
      <Text style={s.consentText}>{children}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  eyebrow: { color: colors.rose, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.56, marginBottom: 10 },
  h1: { color: colors.ink, fontFamily: fonts.display },
  h2: { color: colors.ink, fontFamily: fonts.display, fontSize: 24, lineHeight: 28 },
  lead: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 24.75 },
  titleBlock: { marginBottom: 30 },
  error: { color: colors.alertText, fontFamily: fonts.medium, fontSize: 13, marginTop: 6 },

  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandMark: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.plum, alignItems: "center", justifyContent: "center" },
  brandName: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },

  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(231,223,229,0.78)",
    backgroundColor: "rgba(251,248,244,0.96)",
  },
  topbarStep: { color: colors.muted, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.6 },
  iconButton: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },

  primary: {
    minHeight: 54,
    borderRadius: radius.button,
    backgroundColor: colors.plum,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    alignSelf: "stretch",
  },
  primaryText: { color: colors.white, fontFamily: fonts.bold, fontSize: 16 },
  secondary: {
    minHeight: 54,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  secondaryText: { color: colors.plum, fontFamily: fonts.bold, fontSize: 16 },
  textButton: { color: colors.plum, fontFamily: fonts.bold, fontSize: 14 },

  fieldLabel: { color: colors.label, fontFamily: fonts.bold, fontSize: 13, marginBottom: 8 },
  input: {
    height: 54,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.input,
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {}),
  },
  inputFocused: { borderColor: colors.plum, shadowColor: colors.plum, shadowOpacity: 0.09, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } },
  inputIcon: { position: "absolute", top: 0, bottom: 0, justifyContent: "center", zIndex: 1 },
  suffix: { color: colors.iconGray, fontFamily: fonts.semibold, fontSize: 12 },

  choiceGrid: { flexDirection: "row", gap: 10 },
  choice: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.chip,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceOn: { borderColor: colors.plum, backgroundColor: colors.lilac, borderWidth: 2 },
  choiceText: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 14 },

  consentRow: { flexDirection: "row", alignItems: "flex-start", gap: 11 },
  checkbox: { width: 18, height: 18, marginTop: 1, borderRadius: 4, borderWidth: 1.5, borderColor: colors.borderHover, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  consentText: { flex: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
});
