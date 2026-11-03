import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";

/** Cream page with an optional fixed header and footer around a scrolling body. */
export function Screen({
  header,
  footer,
  children,
  contentStyle,
  topInset = false,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** add the status-bar inset above the body when there is no header */
  topInset?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {header}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          { flexGrow: 1, paddingTop: !header && topInset ? insets.top : 0, paddingBottom: footer ? 0 : insets.bottom },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer}
    </KeyboardAvoidingView>
  );
}

export const Spacer = ({ h }: { h: number }) => <View style={{ height: h }} />;
