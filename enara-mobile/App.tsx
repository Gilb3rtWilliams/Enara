import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { BackHandler, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FlowProvider, ScreenName, useFlow } from "./src/flow";
import { StoreProvider, useStore } from "./src/state/store";
import { colors } from "./src/theme";
import { Assessment } from "./src/screens/Assessment";
import { Calendar } from "./src/screens/Calendar";
import { Dashboard } from "./src/screens/Dashboard";
import { History } from "./src/screens/History";
import { Login } from "./src/screens/Login";
import { Profile } from "./src/screens/Profile";
import { FinalResult, Result } from "./src/screens/Result";
import { Signup } from "./src/screens/Signup";
import { TierTwo } from "./src/screens/TierTwo";
import { Welcome } from "./src/screens/Welcome";

function Router() {
  const { flow, go, patch } = useFlow();
  const { data } = useStore();
  const home: ScreenName = data.signedIn && data.profile ? "dashboard" : "welcome";

  /** Where "back" goes from each screen. null = let the OS handle it (leave the app). */
  const back = (): (() => void) | null => {
    switch (flow.screen) {
      case "login":
      case "signup":
        return () => go("welcome");
      case "profile":
        return () => go("signup");
      case "assessment":
        return () => (flow.section > 0 ? patch({ section: flow.section - 1 }) : go(home));
      case "result":
        return () => go("assessment", { section: 2, pending: null });
      case "tier2":
        return () => go("dashboard");
      case "finalResult":
        return () => go("tier2", { pending: null });
      case "history":
      case "calendar":
        return () => go("dashboard");
      default:
        return null;
    }
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      const action = back();
      if (!action) return false;
      action();
      return true;
    });
    return () => sub.remove();
  });

  switch (flow.screen) {
    case "welcome": return <Welcome />;
    case "login": return <Login />;
    case "signup": return <Signup />;
    case "profile": return <Profile />;
    case "assessment": return <Assessment onBack={() => back()?.()} />;
    case "result": return <Result />;
    case "tier2": return <TierTwo />;
    case "finalResult": return <FinalResult />;
    case "dashboard": return <Dashboard onNavigate={(t) => go(t)} />;
    case "history": return <History onNavigate={(t) => go(t)} />;
    case "calendar": return <Calendar onNavigate={(t) => go(t)} />;
  }
}

function Root() {
  const { ready, data } = useStore();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;
  // Returning users who are signed in on this device go straight to their dashboard.
  const initial: ScreenName = data.signedIn && data.profile ? "dashboard" : "welcome";
  return (
    <FlowProvider initial={initial}>
      <Router />
    </FlowProvider>
  );
}

export default function App() {
  const [loaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold, Fraunces_600SemiBold });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <StoreProvider>
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
