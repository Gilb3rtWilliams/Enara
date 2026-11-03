import { completedLabel } from "./dates";
import { pct } from "./scoring";
import { SavedResult } from "./types";

/** Plain-text summary a person can share with their doctor. */
export function doctorSummary(r: Pick<SavedResult, "prediction" | "answers" | "labs" | "date">, name?: string): string {
  const { prediction: p, answers: a, labs } = r;
  const lines = [
    `Enara screening summary${name ? ` for ${name}` : ""}`,
    completedLabel(r.date).replace("Completed", "Date:"),
    "",
    "Symptoms (0-10)",
    `- Period pain: ${a.dysmenorrhea}`,
    `- Pelvic pain: ${a.pelvicPain}`,
    `- Pain during or after sex: ${a.dyspareunia}`,
    `- Painful bowel movements: ${a.dyschezia}`,
    `- Urinary symptoms: ${a.urinary}`,
    "",
    "Background",
    `- Age ${a.age}, BMI ${a.bmi}`,
    `- Cycle length ${a.cycleLength} days, first period at age ${a.menarcheAge}`,
    `- Family history of endometriosis: ${a.familyHistory}`,
    `- Infertility: ${a.infertility}`,
    "",
    `Tier 1 (symptoms): ${pct(p.tier1.probability)} model score, ${p.tier1.elevated_risk ? "elevated" : "lower"}`,
  ];
  if (p.tier2 && labs) {
    lines.push(
      `Tier 2 (symptoms + blood tests): ${pct(p.tier2.probability)} model score, ${p.tier2.elevated_risk ? "elevated" : "lower"}`,
      `- CA-125: ${labs.ca125} U/mL`,
      `- CRP: ${labs.crp} mg/L`
    );
  }
  lines.push("", p.disclaimer);
  return lines.join("\n");
}
