import { Answers, Labs } from "./types";

type NumSpec = { key: keyof Answers; label: string; min: number; max: number; train: [number, number] };

// min/max mirror the backend's hard limits; train is the range the model learned from.
export const NUMERIC: Record<string, NumSpec> = {
  age: { key: "age", label: "age", min: 10, max: 70, train: [18, 44] },
  bmi: { key: "bmi", label: "BMI", min: 10, max: 70, train: [18, 35] },
  cycleLength: { key: "cycleLength", label: "cycle length", min: 10, max: 90, train: [21, 34] },
  menarcheAge: { key: "menarcheAge", label: "age at first period", min: 7, max: 20, train: [10, 15] },
};

export const LAB_SPEC = {
  ca125: { label: "CA-125", min: 0, max: 2000, train: [10, 200] as [number, number] },
  crp: { label: "CRP", min: 0, max: 500, train: [0, 20] as [number, number] },
};

export type Errors = Record<string, string | undefined>;

const bad = (v: string, min: number, max: number) => v.trim() === "" || Number.isNaN(Number(v)) || Number(v) < min || Number(v) > max;

export function validateSection(section: number, a: Answers): Errors {
  const e: Errors = {};
  if (section === 0) {
    for (const [name, spec] of Object.entries(NUMERIC)) {
      if (bad(String(a[spec.key]), spec.min, spec.max)) e[name] = `Enter your ${spec.label} (${spec.min} to ${spec.max}).`;
    }
  }
  if (section === 2) {
    if (!a.familyHistory) e.familyHistory = "Please choose an answer.";
    if (!a.infertility) e.infertility = "Please choose an answer.";
  }
  return e;
}

export function validateLabs(l: Labs): Errors {
  const e: Errors = {};
  (Object.keys(LAB_SPEC) as (keyof typeof LAB_SPEC)[]).forEach((k) => {
    const s = LAB_SPEC[k];
    if (bad(l[k], s.min, s.max)) e[k] = `Enter your ${s.label} value (${s.min} to ${s.max}).`;
  });
  return e;
}

/** Soft note when a valid number is outside the range the model was trained on. */
export function rangeNote(value: string, min: number, max: number, train: [number, number]): string | null {
  if (value.trim() === "" || Number.isNaN(Number(value))) return null;
  const n = Number(value);
  if (n < min || n > max || (n >= train[0] && n <= train[1])) return null;
  return `The model learned from values between ${train[0]} and ${train[1]}, so this may be less reliable.`;
}

export function ageFromDob(dob: string, now = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d)) age -= 1;
  return age >= 0 && age < 120 ? age : null;
}
