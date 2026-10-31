import { FormEvent, useState } from "react";
import { ApiError, predict } from "../lib/api";
import { ChoiceGroup, Field, Icon, ScoreSlider } from "../components/ui";
import { useFlow } from "../lib/flow";
import { useStore } from "../lib/store";
import { Answers } from "../lib/types";
import { Errors, NUMERIC, rangeNote, validateSection } from "../lib/validation";


const SECTIONS = [
  { eyebrow: "Your cycle", title: "Tell us about your body", description: "These details help establish your baseline. Estimates are completely fine." },
  { eyebrow: "Your symptoms", title: "How have you been feeling?", description: "Rate each symptom based on your experience over the last three months." },
  { eyebrow: "Health history", title: "A little more context", description: "Your health history and wellbeing complete your Tier 1 assessment." },
];

export function Assessment({ onBack }: { onBack: () => void }) {
  const { flow, go, patch } = useFlow();
  const { data, update } = useStore();
  const section = flow.section;
  const a = data.draft;
  const copy = SECTIONS[section];

  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    update((d) => ({ ...d, draft: { ...d.draft, [key]: value } }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const errs = validateSection(section, a);
    setErrors(errs);
    if (Object.keys(errs).some((k) => errs[k])) return;
    if (section < 2) {
      patch({ section: section + 1 });
      window.scrollTo({ top: 0 });
      return;
    }
    setBusy(true);
    setApiError(null);
    try {
      const prediction = await predict(a);
      go("result", { pending: { prediction, answers: a, labs: null } });
      window.scrollTo({ top: 0 });
    } catch (e) {
      setApiError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const num = (name: keyof typeof NUMERIC, label: string, placeholder: string, suffix?: string) => {
    const spec = NUMERIC[name];
    const value = String(a[spec.key]);
    return (
      <Field
        label={label}
        name={name}
        type="number"
        inputMode="decimal"
        placeholder={placeholder}
        suffix={suffix}
        value={value}
        onChange={(v) => set(spec.key as any, v as any)}
        error={errors[name]}
        note={rangeNote(value, spec.min, spec.max, spec.train)}
      />
    );
  };

  return (
    <>
      <header className="assessment-header">
        <button type="button" className="icon-button" onClick={onBack} aria-label="Go back">
          <Icon name="back" />
        </button>
        <div className="progress-track">
          <div className={`progress-fill progress-${section + 1}`} aria-label={`${section + 1} of 3 sections complete`} />
        </div>
        <span className="progress-label">{section + 1}/3</span>
      </header>
      <main className="screen-content assessment-content">
        <div className="title-block">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <form onSubmit={submit} className="form-stack assessment-form" noValidate>
          {section === 0 && (
            <>
              {num("age", "Current age", "e.g. 29", "years")}
              {num("bmi", "Body mass index (BMI)", "e.g. 22.4")}
              <div className="field-row">
                {num("cycleLength", "Cycle length", "28", "days")}
                {num("menarcheAge", "Age at first period", "12", "years")}
              </div>
            </>
          )}
          {section === 1 && (
            <>
              <div className="scale-explainer">
                <span>0</span>
                <p>Use the 0–10 scale for each symptom</p>
                <span>10</span>
              </div>
              <ScoreSlider label="Period pain" hint="Dysmenorrhea" value={a.dysmenorrhea} onChange={(v) => set("dysmenorrhea", v)} />
              <ScoreSlider label="Pelvic pain" hint="Outside of your period" value={a.pelvicPain} onChange={(v) => set("pelvicPain", v)} />
              <ScoreSlider label="Pain during or after sex" hint="Dyspareunia" value={a.dyspareunia} onChange={(v) => set("dyspareunia", v)} />
              <ScoreSlider label="Painful bowel movements" hint="Dyschezia" value={a.dyschezia} onChange={(v) => set("dyschezia", v)} />
              <ScoreSlider label="Urinary symptoms" hint="Pain, urgency, or frequency" value={a.urinary} onChange={(v) => set("urinary", v)} />
            </>
          )}
          {section === 2 && (
            <>
              <ChoiceGroup label="Family history of endometriosis?" name="familyHistory" options={[{ label: "Yes", value: "Yes" as const }, { label: "No", value: "No" as const }]} value={a.familyHistory} onChange={(v) => set("familyHistory", v)} error={errors.familyHistory} />
              <ChoiceGroup label="Have you experienced infertility?" name="infertility" options={[{ label: "Yes", value: "Yes" as const }, { label: "No", value: "No" as const }]} value={a.infertility} onChange={(v) => set("infertility", v)} error={errors.infertility} />
              <ScoreSlider label="Mental wellbeing" hint="How supported and emotionally well do you feel?" value={a.mentalHealth} onChange={(v) => set("mentalHealth", v)} />
            </>
          )}
          {apiError ? <p className="error-banner" role="alert">{apiError}</p> : null}
          <button className="primary-button sticky-action" type="submit" disabled={busy}>
            {section === 2 ? (busy ? "Analysing…" : "View my result") : "Continue"}
            <Icon name={section === 2 ? "spark" : "arrow"} size={19} />
          </button>
        </form>
      </main>
    </>
  );
}
