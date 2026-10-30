// Field definitions. `name` is the API field name (snake_case) used by POST /predict.
// min/max mirror the backend's hard limits; `train` is the range the model was trained on.

const score = (name, label, hint) => ({
  name, label, hint, kind: "scale", min: 0, max: 10,
});

export const STEPS = [
  {
    id: "about",
    title: "About you",
    intro: "Two basic measurements.",
    fields: [
      { name: "age", label: "Age", kind: "number", unit: "years", min: 10, max: 70, step: 1, train: [18, 44] },
      { name: "bmi", label: "BMI", kind: "number", unit: "kg/m²", min: 10, max: 70, step: 0.1, train: [18, 35] },
    ],
  },
  {
    id: "cycle",
    title: "Your cycle",
    intro: "Think about a typical cycle.",
    fields: [
      {
        name: "cycle_length", label: "Cycle length", kind: "number", unit: "days",
        hint: "From the first day of one period to the first day of the next.",
        min: 10, max: 90, step: 1, train: [21, 34],
      },
      {
        name: "age_of_menarche", label: "Age at your first period", kind: "number", unit: "years",
        min: 7, max: 20, step: 1, train: [10, 15],
      },
    ],
  },
  {
    id: "symptoms",
    title: "Symptoms",
    intro: "Rate each from 0 (none) to 10 (the worst you can imagine), based on the last few months.",
    fields: [
      score("dysmenorrhea_score", "Period pain", "Pain during your period."),
      score("pelvic_pain_score", "Pelvic pain", "Pain in your lower abdomen or pelvis."),
      score("dyspareunia_score", "Pain during sex", "Pain during or after sex."),
      score("dyschezia_score", "Painful bowel movements", "Pain when passing stool."),
      score("urinary_symptoms_score", "Urinary symptoms", "Pain or urgency when passing urine."),
      score("mental_health_score", "Mental health impact", "How much your mood or wellbeing has been affected."),
    ],
  },
  {
    id: "history",
    title: "History",
    intro: "Two yes or no questions.",
    fields: [
      { name: "family_history", label: "Has a close relative been diagnosed with endometriosis?", kind: "binary" },
      { name: "infertility_status", label: "Are you currently having difficulty getting pregnant?", kind: "binary" },
    ],
  },
];

export const LAB_FIELDS = [
  {
    name: "ca_125_level", label: "CA-125", kind: "number", unit: "U/mL",
    hint: "Copy the number from your lab report.", min: 0, max: 2000, step: 0.1, train: [10, 200],
  },
  {
    name: "crp_level", label: "CRP", kind: "number", unit: "mg/L",
    hint: "Copy the number from your lab report.", min: 0, max: 500, step: 0.1, train: [0, 20],
  },
];

export const ALL_FIELDS = STEPS.flatMap((s) => s.fields);

export const initialValues = () =>
  Object.fromEntries(ALL_FIELDS.map((f) => [f.name, f.kind === "number" ? "" : null]));

/** Returns { fieldName: message } for every invalid field in `fields`. */
export function validateFields(fields, values) {
  const errors = {};
  for (const f of fields) {
    const v = values[f.name];
    if (f.kind === "number") {
      const n = Number(v);
      if (v === "" || v === null || Number.isNaN(n) || n < f.min || n > f.max) {
        errors[f.name] = `Enter a number between ${f.min} and ${f.max}.`;
      }
    } else if (v === null || v === undefined) {
      errors[f.name] = "Choose an answer.";
    }
  }
  return errors;
}

/** Soft warning when a valid number is outside the model's training range. */
export function rangeNote(field, value) {
  if (field.kind !== "number" || !field.train || value === "" || Number.isNaN(Number(value))) return null;
  const n = Number(value);
  const [lo, hi] = field.train;
  if (n < field.min || n > field.max || (n >= lo && n <= hi)) return null;
  return `The model was trained on values from ${lo} to ${hi}, so this result may be less reliable.`;
}

export function buildPayload(values, labs) {
  const payload = {};
  for (const f of ALL_FIELDS) payload[f.name] = Number(values[f.name]);
  if (labs) {
    payload.ca_125_level = Number(labs.ca_125_level);
    payload.crp_level = Number(labs.crp_level);
  }
  return payload;
}
