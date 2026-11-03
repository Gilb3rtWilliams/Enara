import { Answers, Labs, Prediction } from "./types";

// Default: same machine/host that serves the web app, port 8000.
// Override with VITE_API_URL (see .env.example).
export const API_BASE = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`).replace(/\/$/, "");

export class ApiError extends Error {}

const yn = (v: string) => (v === "Yes" ? 1 : 0);

/** Answers (+ optional lab values) -> the API's snake_case request body. */
export function buildPayload(a: Answers, labs?: Labs | null) {
  const body: Record<string, number> = {
    age: Number(a.age),
    bmi: Number(a.bmi),
    cycle_length: Number(a.cycleLength),
    age_of_menarche: Number(a.menarcheAge),
    dysmenorrhea_score: a.dysmenorrhea,
    pelvic_pain_score: a.pelvicPain,
    dyspareunia_score: a.dyspareunia,
    dyschezia_score: a.dyschezia,
    urinary_symptoms_score: a.urinary,
    family_history: yn(a.familyHistory),
    infertility_status: yn(a.infertility),
    mental_health_score: a.mentalHealth,
  };
  if (labs) {
    body.ca_125_level = Number(labs.ca125);
    body.crp_level = Number(labs.crp);
  }
  return body;
}

function describe(detail: unknown): string | null {
  if (!Array.isArray(detail)) return null;
  return detail
    .slice(0, 3)
    .map((d: { loc?: string[]; msg?: string }) => {
      const field = String(d.loc?.[d.loc.length - 1] ?? "").replace(/_/g, " ");
      return field && field !== "body" ? `${field}: ${d.msg}` : d.msg;
    })
    .join(" ");
}

export async function predict(answers: Answers, labs?: Labs | null): Promise<Prediction> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(answers, labs)),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(`Can’t reach the Enara service at ${API_BASE}. Make sure the backend is running, then try again.`);
  } finally {
    clearTimeout(timer);
  }

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const detail = describe(body?.detail);
    throw new ApiError(res.status === 422 && detail ? `The service rejected an answer. ${detail}` : "The Enara service returned an error. Please try again.");
  }
  return body as Prediction;
}
