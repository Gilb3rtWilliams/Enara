import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppData, emptyData } from "./types";

const KEY = "enara.web.v1";

type Ctx = {
  data: AppData;
  update: (fn: (d: AppData) => AppData) => void;
  wipe: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...emptyData, ...JSON.parse(raw) };
  } catch {
    /* storage blocked or corrupted: start fresh */
  }
  return emptyData;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(load);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* private mode / quota: keep working in memory */
    }
  }, [data]);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);
  const wipe = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setData(emptyData);
  }, []);

  return <StoreContext.Provider value={{ data, update, wipe }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
