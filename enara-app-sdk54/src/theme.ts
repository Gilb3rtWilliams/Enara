// Design tokens taken from the Figma Make export (index.css).
export const colors = {
  ink: "#2e2530",
  muted: "#746b74",
  plum: "#673651",
  plumDark: "#4e273d",
  rose: "#b66e80",
  lilac: "#eee7f0",
  cream: "#fbf8f4",
  line: "#e7dfe5",
  white: "#ffffff",
  label: "#514750",
  placeholder: "#ada4ab",
  iconGray: "#8d818a",
  borderHover: "#cfc1cc",
  borderSoft: "#d9ced6",
  faint: "#8a8188",
  faintest: "#91888f",
  welcomeBg: "#d9c6d5",
  // status
  okBg: "#e3f1ea",
  okText: "#2f6b50",
  alertBg: "#f8dfe4",
  alertText: "#8c2f48",
};

export const fonts = {
  body: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semibold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
  display: "Fraunces_600SemiBold",
};

export const radius = { input: 15, button: 16, card: 22, chip: 14 };

/** CSS "0 9px 24px rgba(...)" style shadow as React Native props. */
export const shadow = (opacity = 0.18, y = 9, blur = 24, color = colors.plum) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: blur / 2,
  elevation: Math.round(blur / 5),
});
