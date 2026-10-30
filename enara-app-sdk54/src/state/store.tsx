import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppData, emptyData } from "../types";

const KEY = "enara.v1";

type Ctx = {
  ready: boolean;
  data: AppData;
  update: (fn: (d: AppData) => AppData) => void;
  wipe: () => Promise<void>;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setData({ ...emptyData, ...JSON.parse(raw) });
      } catch {
        /* corrupted or unavailable storage: start fresh */
      }
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);
  const wipe = useCallback(async () => {
    await AsyncStorage.removeItem(KEY).catch(() => {});
    setData(emptyData);
  }, []);

  return <StoreContext.Provider value={{ ready, data, update, wipe }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
