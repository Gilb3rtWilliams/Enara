import React, { createContext, useCallback, useContext, useState } from "react";
import { Answers, Labs, Prediction } from "./types";

/** A result that has been calculated but not yet saved. Kept in sessionStorage so a refresh doesn't lose it. */
export type Pending = { prediction: Prediction; answers: Answers; labs: Labs | null };

const KEY = "enara.pending";

type Ctx = { pending: Pending | null; setPending: (p: Pending | null) => void };
const SessionContext = createContext<Ctx | null>(null);

function load(): Pending | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Pending) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [pending, setState] = useState<Pending | null>(load);
  const setPending = useCallback((p: Pending | null) => {
    setState(p);
    try {
      if (p) sessionStorage.setItem(KEY, JSON.stringify(p));
      else sessionStorage.removeItem(KEY);
    } catch {
      /* private mode: keep in memory only */
    }
  }, []);
  return <SessionContext.Provider value={{ pending, setPending }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const c = useContext(SessionContext);
  if (!c) throw new Error("useSession must be used inside SessionProvider");
  return c;
}
