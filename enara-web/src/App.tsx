import { useEffect } from "react";
import { FlowProvider, ScreenName, useFlow } from "./lib/flow";
import { StoreProvider, useStore } from "./lib/store";
import { Assessment } from "./screens/Assessment";
import { Calendar } from "./screens/Calendar";
import { Dashboard } from "./screens/Dashboard";
import { History } from "./screens/History";
import { Login } from "./screens/Login";
import { Profile } from "./screens/Profile";
import { FinalResult, Result } from "./screens/Result";
import { Signup } from "./screens/Signup";
import { TierTwo } from "./screens/TierTwo";
import { Welcome } from "./screens/Welcome";

function Router() {
  const { flow, go, patch } = useFlow();
  const { data } = useStore();
  const home: ScreenName = data.signedIn && data.profile ? "dashboard" : "welcome";

  // start each screen at the top, like a native app
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [flow.screen, flow.section]);

  const back = () => {
    switch (flow.screen) {
      case "login":
      case "signup":
        return go("welcome");
      case "profile":
        return go("signup");
      case "assessment":
        return flow.section > 0 ? patch({ section: flow.section - 1 }) : go(home);
      case "result":
        return go("assessment", { section: 2, pending: null });
      case "finalResult":
        return go("tier2", { pending: null });
      default:
        return go(home);
    }
  };

  switch (flow.screen) {
    case "welcome": return <Welcome />;
    case "login": return <Login />;
    case "signup": return <Signup />;
    case "profile": return <Profile />;
    case "assessment": return <Assessment onBack={back} />;
    case "result": return <Result />;
    case "tier2": return <TierTwo />;
    case "finalResult": return <FinalResult />;
    case "dashboard": return <Dashboard onNavigate={(t) => go(t)} />;
    case "history": return <History onNavigate={(t) => go(t)} />;
    case "calendar": return <Calendar onNavigate={(t) => go(t)} />;
  }
}

function Root() {
  const { data } = useStore();
  const initial: ScreenName = data.signedIn && data.profile ? "dashboard" : "welcome";
  return (
    <FlowProvider initial={initial}>
      <div className="app-shell">
        <div className="phone-frame">
          <Router />
        </div>
      </div>
    </FlowProvider>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Root />
    </StoreProvider>
  );
}
