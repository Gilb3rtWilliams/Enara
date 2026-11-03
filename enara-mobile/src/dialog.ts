import { Alert, Platform } from "react-native";

type Button = { text: string; style?: "default" | "cancel" | "destructive"; onPress?: () => void };

/** Alert.alert does nothing on web, so fall back to the browser dialogs there. */
export function notify(title: string, message?: string) {
  if (Platform.OS === "web") {
    // eslint-disable-next-line no-alert
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

export function choose(title: string, message: string, buttons: Button[]) {
  if (Platform.OS === "web") {
    const action = buttons.find((b) => b.style !== "cancel" && b.style !== "destructive") ?? buttons.find((b) => b.style === "destructive");
    // eslint-disable-next-line no-alert
    if (action && window.confirm(`${title}\n\n${message}\n\nOK = ${action.text}`)) action.onPress?.();
  } else {
    Alert.alert(title, message, buttons);
  }
}
