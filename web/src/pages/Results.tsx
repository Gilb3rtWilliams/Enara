import { FormEvent, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Field, FieldError, ScoreRing } from "../components/Form";
import { Icon } from "../components/Icon";
import { ApiError, predict } from "../lib/api";
import { recordFrom } from "../lib/actions";
import { levelOf, pct } from "../lib/scoring";
import { useSession } from "../lib/session";
import { shareSummary } from "../lib/share";
import { useStore } from "../lib/store";
import { Labs } from "../lib/types";
import { useTitle } from "../lib/useTitle";
import { Errors, LAB_SPEC, rangeNote, validateLabs } from "../lib/validation";

const URGENT = "If you have severe or sudden pain, heavy bleeding, fainting, or feel acutely unwell, seek urgent medical care.";

/** Tier 1 result, straight from the model via POST /predict. */
export function Result() {
  useTitle("Your Tier 1 result · Enara");
  const navigate = useNavigate();
  const { pending, setPending } = useSession();
  const { data, update } = useStore();
  const leaving = useRef(false); // set while navigating away after saving, so the guard below doesn't redirect
  if (!pending) return leaving.current ? null : <Navigate to="/check" replace />;

  const p = pending.prediction;
  const elevated = p.tier1.elevated_risk;
  const level = levelOf(elevated);

  function save() {
    leaving.current = true;
    update((d) => ({ ...d, results: [recordFrom(pending!), ...d.results] }));
    setPending(null);
    navigate("/dashboard");
  }

  return (
    <div className="result-layout">
      <section className="result-hero-card">
        <span className="result-kicker">Tier 1 assessment result</span>
        <ScoreRing p={p.tier1.probability} text={pct(p.tier1.probability)} label="pattern match" />
        <span className={`risk-pill risk-${level.toLowerCase()}`}>{level} indication</span>
        <h1>
          {elevated
            ? "Your responses show several patterns that can be associated with endometriosis."
            : "Your responses show fewer patterns commonly associated with endometriosis."}
        </h1>
        <p>This result is a screening insight, not a diagnosis. Only a qualified clinician can diagnose endometriosis.</p>
      </section>

      <div className="result-side">
        <section className="card">
          {elevated ? (
            <>
              <p className="eyebrow">Tier 2 recommended</p>
              <h2>Discuss blood testing at a hospital</h2>
              <p>
                Tier 2 adds two blood test values, CA-125 and CRP, to your symptom answers. Ask a healthcare professional whether these tests are appropriate for you, then add your results from your dashboard.
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow">Next step</p>
              <h2>No blood tests needed right now</h2>
              <p>
                Your answers did not reach the model’s elevated-risk cutoff, so Tier 2 isn’t suggested. If your symptoms continue or get worse, speak to a healthcare professional and retake the assessment.
              </p>
            </>
          )}
          <div className="card-actions">
            <button type="button" className="btn btn-primary" onClick={save}>
              Save result to dashboard <Icon name="arrow" size={18} />
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => shareSummary({ ...pending, date: new Date().toISOString() }, data.profile?.name)}>
              Prepare doctor summary
            </button>
          </div>
        </section>

        {p.warnings.length ? (
          <section className="notice">
            {p.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </section>
        ) : null}

        <p className="urgent-note">{URGENT}</p>
        <Link className="text-link" to="/check" onClick={() => setPending(null)}>
          Retake the assessment
        </Link>
      </div>
    </div>
  );
}

/** Combined result after adding hospital blood-test values. */
export function Combined() {
  useTitle("Your combined result · Enara");
  const navigate = useNavigate();
  const { pending, setPending } = useSession();
  const { data, update } = useStore();
  const leaving = useRef(false);
  if (!pending || !pending.prediction.tier2) return leaving.current ? null : <Navigate to="/dashboard" replace />;

  const t1 = pending.prediction.tier1;
  const t2 = pending.prediction.tier2;
  const elevated = t2.elevated_risk;
  const level = levelOf(elevated);
  const labs = pending.labs;

  function save() {
    leaving.current = true;
    update((d) => ({ ...d, results: [recordFrom(pending!), ...d.results] }));
    setPending(null);
    navigate("/dashboard");
  }

  return (
    <div className="result-layout">
      <section className="result-hero-card">
        <span className="result-kicker">Combined assessment</span>
        <ScoreRing p={t2.probability} text={pct(t2.probability)} label="final pattern match" />
        <span className={`risk-pill risk-${level.toLowerCase()}`}>{level} indication</span>
        <h1>
          {elevated
            ? "Your combined results show a stronger pattern associated with endometriosis."
            : "Your combined results show fewer patterns commonly associated with endometriosis."}
        </h1>
        <p>This re-scores your symptom answers together with the CA-125 and CRP values from your hospital report.</p>
      </section>

      <div className="result-side">
        <section className="card">
          <p className="eyebrow">Your two steps</p>
          <ul className="tier-summary">
            <li>
              <span className="step-num">1</span>
              <div><small>Tier 1</small><strong>{pct(t1.probability)} match</strong><span>Symptoms and health history</span></div>
              <Icon name="check" size={18} />
            </li>
            <li>
              <span className="step-num">2</span>
              <div><small>Tier 2</small><strong>Results included</strong><span>CA-125: {labs?.ca125} U/mL · CRP: {labs?.crp} mg/L</span></div>
              <Icon name="check" size={18} />
            </li>
          </ul>
        </section>

        <section className="card guidance">
          <span className="guidance-icon"><Icon name="shield" size={22} /></span>
          <div>
            <p className="eyebrow">What this means</p>
            <h2>Review this result with your clinician</h2>
            <p>
              Neither this result nor these blood markers can confirm endometriosis. A clinician may recommend examination, imaging, or other investigations based on your individual circumstances.
            </p>
            <div className="card-actions">
              <button type="button" className="btn btn-primary" onClick={save}>
                Save final result <Icon name="arrow" size={18} />
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => shareSummary({ ...pending, date: new Date().toISOString() }, data.profile?.name)}>
                Prepare doctor summary
              </button>
            </div>
          </div>
        </section>
        <p className="urgent-note">{URGENT}</p>
      </div>
    </div>
  );
}

/** Add CA-125 and CRP values to a saved Tier 1 assessment. */
export function Tier2() {
  useTitle("Add blood test results · Enara");
  const navigate = useNavigate();
  const { data } = useStore();
  const { setPending } = useSession();
  const base = data.results[0]; // the saved Tier 1 assessment these results belong to
  const [labs, setLabs] = useState<Labs>({ ca125: "", crp: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  if (!base) return <Navigate to="/dashboard" replace />;

  const set = (k: keyof Labs, v: string) => {
    setLabs((l) => ({ ...l, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const errs = validateLabs(labs);
    setErrors(errs);
    if (Object.keys(errs).some((k) => errs[k])) return;
    setBusy(true);
    setApiError(null);
    try {
      const prediction = await predict(base.answers, labs);
      if (!prediction.tier2) {
        setApiError("The Tier 2 result couldn’t be calculated for these answers. Please try again.");
        return;
      }
      setPending({ prediction, answers: base.answers, labs });
      navigate("/result/combined");
    } catch (e) {
      setApiError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const note = (k: keyof Labs) => {
    const s = LAB_SPEC[k];
    return rangeNote(labs[k], s.min, s.max, s.train);
  };

  return (
    <div className="check-layout tier2-layout">
      <section className="card check-card">
        <span className="tier-badge">Hospital blood tests</span>
        <p className="eyebrow">Clinical follow-up</p>
        <h1>Add your Tier 2 results</h1>
        <p className="card-lead">Enter results only from a hospital or accredited laboratory report. These biomarkers should be interpreted by a healthcare professional.</p>
        <form onSubmit={submit} className="form" noValidate>
          <div className="form-grid two">
            <Field label="CA-125 level" name="ca125" type="number" inputMode="decimal" placeholder="e.g. 24" suffix="U/mL" value={labs.ca125} onChange={(v) => set("ca125", v)} error={errors.ca125} note={note("ca125")} />
            <Field label="CRP level" name="crp" type="number" inputMode="decimal" placeholder="e.g. 3.1" suffix="mg/L" value={labs.crp} onChange={(v) => set("crp", v)} error={errors.crp} note={note("crp")} />
          </div>
          {apiError ? <FieldError>{apiError}</FieldError> : null}
          <div className="form-actions">
            <Link className="btn btn-quiet" to="/dashboard">Cancel</Link>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Calculating…" : "Save hospital results"} <Icon name="check" size={19} />
            </button>
          </div>
        </form>
      </section>
      <aside className="notice side-notice">
        <Icon name="shield" size={22} />
        <h3>Supporting context only</h3>
        <p>CA-125 and CRP cannot diagnose endometriosis on their own. Many conditions can raise them. Enara uses them only to refine the picture from your symptoms.</p>
        <p>This re-scores your saved symptom answers together with the two values, so you don’t need to answer the questions again.</p>
      </aside>
    </div>
  );
}
