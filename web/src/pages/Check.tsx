import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChoiceGroup, Field, FieldError, ScoreSlider } from "../components/Form";
import { Icon } from "../components/Icon";
import { ApiError, predict } from "../lib/api";
import { useSession } from "../lib/session";
import { useStore } from "../lib/store";
import { Answers } from "../lib/types";
import { useTitle } from "../lib/useTitle";
import { Errors, NUMERIC, rangeNote, validateSection } from "../lib/validation";

const SECTIONS = [
  { short: "Your cycle", eyebrow: "Part 1 of 3", title: "Tell us about your body", description: "These details help establish your baseline. Estimates are completely fine." },
  { short: "Your symptoms", eyebrow: "Part 2 of 3", title: "How have you been feeling?", description: "Rate each symptom from 0 (none) to 10 (severe), based on the last three months." },
  { short: "Health history", eyebrow: "Part 3 of 3", title: "A little more context", description: "Your health history and wellbeing complete your Tier 1 assessment." },
];

export function Check() {
  useTitle("Symptom check · Enara");
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const section = Math.min(2, Math.max(0, (Number(params.get("part")) || 1) - 1));
  const { data, update } = useStore();
  const { setPending } = useSession();
  const a = data.draft;
  const copy = SECTIONS[section];

  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const goPart = (n: number) => {
    setParams({ part: String(n + 1) });
    window.scrollTo({ top: 0 });
  };

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    update((d) => ({ ...d, draft: { ...d.draft, [key]: value } }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const errs = validateSection(section, a);
    setErrors(errs);
    if (Object.keys(errs).some((k) => errs[k])) return;
    if (section < 2) return goPart(section + 1);
    setBusy(true);
    setApiError(null);
    try {
      const prediction = await predict(a);
      setPending({ prediction, answers: a, labs: null });
      navigate("/result");
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
    <div className="check-layout">
      <aside className="stepper" aria-label="Progress">
        <ol>
          {SECTIONS.map((s, i) => (
            <li key={s.short} className={i === section ? "current" : i < section ? "done" : ""} aria-current={i === section ? "step" : undefined}>
              <span className="step-badge">{i < section ? <Icon name="check" size={15} /> : i + 1}</span>
              <div>
                <strong>{s.short}</strong>
                <small>{s.eyebrow}</small>
              </div>
            </li>
          ))}
        </ol>
        <p className="stepper-note">Your answers are saved as you go, so you can pause and come back.</p>
      </aside>

      <section className="card check-card">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="card-lead">{copy.description}</p>

        <form onSubmit={submit} className="form" noValidate>
          {section === 0 && (
            <>
              <div className="form-grid two">
                {num("age", "Current age", "e.g. 29", "years")}
                {num("bmi", "Body mass index (BMI)", "e.g. 22.4")}
                {num("cycleLength", "Cycle length", "28", "days")}
                {num("menarcheAge", "Age at first period", "12", "years")}
              </div>
            </>
          )}
          {section === 1 && (
            <div className="slider-grid">
              <ScoreSlider label="Period pain" hint="Dysmenorrhea" value={a.dysmenorrhea} onChange={(v) => set("dysmenorrhea", v)} />
              <ScoreSlider label="Pelvic pain" hint="Outside of your period" value={a.pelvicPain} onChange={(v) => set("pelvicPain", v)} />
              <ScoreSlider label="Pain during or after sex" hint="Dyspareunia" value={a.dyspareunia} onChange={(v) => set("dyspareunia", v)} />
              <ScoreSlider label="Painful bowel movements" hint="Dyschezia" value={a.dyschezia} onChange={(v) => set("dyschezia", v)} />
              <ScoreSlider label="Urinary symptoms" hint="Pain, urgency, or frequency" value={a.urinary} onChange={(v) => set("urinary", v)} />
            </div>
          )}
          {section === 2 && (
            <>
              <div className="form-grid two">
                <ChoiceGroup label="Family history of endometriosis?" name="familyHistory" options={[{ label: "Yes", value: "Yes" as const }, { label: "No", value: "No" as const }]} value={a.familyHistory} onChange={(v) => set("familyHistory", v)} error={errors.familyHistory} />
                <ChoiceGroup label="Have you experienced infertility?" name="infertility" options={[{ label: "Yes", value: "Yes" as const }, { label: "No", value: "No" as const }]} value={a.infertility} onChange={(v) => set("infertility", v)} error={errors.infertility} />
              </div>
              <ScoreSlider label="Mental wellbeing" hint="How supported and emotionally well do you feel?" value={a.mentalHealth} onChange={(v) => set("mentalHealth", v)} />
            </>
          )}

          {apiError ? <FieldError>{apiError}</FieldError> : null}

          <div className="form-actions">
            {section > 0 ? (
              <button type="button" className="btn btn-quiet" onClick={() => goPart(section - 1)}>
                <Icon name="back" size={18} /> Back
              </button>
            ) : (
              <Link className="btn btn-quiet" to="/dashboard">Cancel</Link>
            )}
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {section === 2 ? (busy ? "Analysing…" : "View my result") : "Continue"} <Icon name={section === 2 ? "spark" : "arrow"} size={19} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
