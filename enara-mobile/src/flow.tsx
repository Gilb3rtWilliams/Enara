import React, { createContext, useCallback, useContext, useState } from "react";
import { Answers, Labs, Prediction } from "./types";

export type ScreenName =
  | "welcome" | "login" | "signup" | "profile" | "assessment" | "result"
  | "dashboard" | "tier2" | "finalResult" | "history" | "calendar";

export type Pending = { prediction: Prediction; answers: Answers; labs: Labs | null };

type FlowState = {
  screen: ScreenName;
  section: number; // assessment section 0-2
  signup: { email: string; password: string } | null;
  pending: Pending | null; // a result that has been calculated but not yet saved
};

type FlowCtx = {
  flow: FlowState;
  go: (screen: ScreenName, patch?: Partial<FlowState>) => void;
  patch: (p: Partial<FlowState>) => void;
};

const Ctx = createContext<FlowCtx | null>(null);

export function FlowProvider({ initial, children }: { initial: ScreenName; children: React.ReactNode }) {
  const [flow, setFlow] = useState<FlowState>({ screen: initial, section: 0, signup: null, pending: null });
  const go = useCallback((screen: ScreenName, p: Partial<FlowState> = {}) => setFlow((f) => ({ ...f, ...p, screen })), []);
  const patch = useCallback((p: Partial<FlowState>) => setFlow((f) => ({ ...f, ...p })), []);
  return <Ctx.Provider value={{ flow, go, patch }}>{children}</Ctx.Provider>;
}

export function useFlow() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFlow must be used inside FlowProvider");
  return c;
}
