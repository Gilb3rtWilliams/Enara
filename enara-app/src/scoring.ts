import { Prediction } from "./types";

export type Level = "Elevated" | "Lower";

/** Model score as the design's "pattern match" percentage. */
export const pct = (p: number) => (p >= 0.995 ? ">99%" : p < 0.005 ? "<1%" : `${Math.round(p * 100)}%`);

/** The backend has one cutoff (elevated or not), so there are two levels, not three. */
export const levelOf = (elevated: boolean): Level => (elevated ? "Elevated" : "Lower");

/** The most informative tier available in a prediction. */
export function headline(p: Prediction) {
  const t = p.tier2 ?? p.tier1;
  return { probability: t.probability, elevated: t.elevated_risk, level: levelOf(t.elevated_risk), combined: !!p.tier2 };
}
