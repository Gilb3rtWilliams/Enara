import { addDays, diffDays, fromYmd, ymd } from "./dates";

export type Run = { start: Date; length: number };

/** Group logged period days into consecutive runs, oldest first. */
export function periodRuns(days: string[]): Run[] {
  const sorted = [...new Set(days)].sort();
  const runs: Run[] = [];
  for (const s of sorted) {
    const d = fromYmd(s);
    const last = runs[runs.length - 1];
    if (last && diffDays(d, addDays(last.start, last.length - 1)) === 1) last.length += 1;
    else runs.push({ start: d, length: 1 });
  }
  return runs;
}

export type CycleInfo = {
  cycleDay: number;
  phase: string;
  nextStart: Date;
  daysUntil: number;
  periodLength: number;
};

export function cycleInfo(periodDays: string[], cycleLength: number, today: Date): CycleInfo | null {
  const runs = periodRuns(periodDays).filter((r) => r.start <= today);
  if (!runs.length) return null;
  const last = runs[runs.length - 1];
  const finished = runs.slice(0, -1);
  const periodLength = Math.min(10, Math.max(2, finished.length ? Math.round(finished.reduce((a, r) => a + r.length, 0) / finished.length) : 5));
  const cycleDay = diffDays(today, last.start) + 1;
  const nextStart = addDays(last.start, cycleLength);
  const ovulation = cycleLength - 14;
  const phase =
    cycleDay <= Math.max(last.length, periodLength) && cycleDay <= 10
      ? "Menstrual phase"
      : cycleDay < ovulation - 1
        ? "Follicular phase"
        : cycleDay <= ovulation + 1
          ? "Ovulation window"
          : "Luteal phase";
  return { cycleDay, phase, nextStart, daysUntil: diffDays(nextStart, today), periodLength };
}

/** Days of the next predicted period that are still in the future. */
export function predictedDays(info: CycleInfo | null, today: Date): Set<string> {
  const out = new Set<string>();
  if (!info) return out;
  for (let i = 0; i < info.periodLength; i++) {
    const d = addDays(info.nextStart, i);
    if (d > today) out.add(ymd(d));
  }
  return out;
}

/** 6x7-ish Monday-first grid of dates for a month, with leading/trailing days. */
export function monthGrid(year: number, month: number): { date: Date; outside: boolean }[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;
  return Array.from({ length: total }, (_, i) => {
    const date = new Date(year, month, 1 - lead + i);
    return { date, outside: date.getMonth() !== month };
  });
}
