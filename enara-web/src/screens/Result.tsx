import { Brand, Icon } from "../components/ui";
import { useFlow } from "../lib/flow";
import { recordFrom } from "../lib/actions";
import { levelOf, pct } from "../lib/scoring";
import { shareSummary } from "../lib/share";
import { useStore } from "../lib/store";

const URGENT = "If you have severe or sudden pain, heavy bleeding, fainting, or feel acutely unwell, seek urgent medical care.";

const ringStyle = (p: number) => ({ ["--p" as string]: `${Math.round(Math.min(1, Math.max(0.02, p)) * 1000) / 10}%` });

/** Tier 1 result, straight from the model via POST /predict. */
export function Result() {
  const { flow, go } = useFlow();
  const { data, update } = useStore();
  const pending = flow.pending;
  if (!pending) return null;

  const p = pending.prediction;
  const elevated = p.tier1.elevated_risk;
  const level = levelOf(elevated);

  function save() {
    update((d) => ({ ...d, results: [recordFrom(pending!), ...d.results] }));
    go("dashboard", { pending: null });
  }

  return (
    <main className="result-screen">
      <div className="result-topbar">
        <Brand compact />
        <span className="complete-pill">
          <Icon name="check" size={14} />
          Complete
        </span>
      </div>
      <div className="result-hero">
        <span className="result-kicker">Tier 1 assessment result</span>
        <div className="score-ring" style={ringStyle(p.tier1.probability)}>
          <div>
            <strong>{pct(p.tier1.probability)}</strong>
            <span>pattern match</span>
          </div>
        </div>
        <span className={`risk-pill risk-${level.toLowerCase()}`}>{level} indication</span>
        <h1>
          {elevated
            ? "Your responses show several patterns that can be associated with endometriosis."
            : "Your responses show fewer patterns commonly associated with endometriosis."}
        </h1>
        <p>This result is a screening insight, not a diagnosis. Only a qualified clinician can diagnose endometriosis.</p>
      </div>
      <section className="next-steps">
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
        <button type="button" className="primary-button" onClick={() => shareSummary({ ...pending, date: new Date().toISOString() }, data.profile?.name)}>
          Prepare doctor summary
          <Icon name="arrow" size={19} />
        </button>
      </section>
      {p.warnings.length ? (
        <div className="result-warnings">
          {p.warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      ) : null}
      <section className="result-actions">
        <button type="button" className="secondary-button" onClick={save}>
          Save result to dashboard
        </button>
        <button type="button" className="text-button" onClick={() => go("assessment", { section: 0, pending: null })}>
          Retake assessment
        </button>
      </section>
      <p className="result-disclaimer">{URGENT}</p>
    </main>
  );
}

/** Combined result after adding hospital blood-test values. */
export function FinalResult() {
  const { flow, go } = useFlow();
  const { data, update } = useStore();
  const pending = flow.pending;
  if (!pending || !pending.prediction.tier2) return null;

  const t1 = pending.prediction.tier1;
  const t2 = pending.prediction.tier2;
  const elevated = t2.elevated_risk;
  const level = levelOf(elevated);
  const labs = pending.labs;

  function save() {
    update((d) => ({ ...d, results: [recordFrom(pending!), ...d.results] }));
    go("dashboard", { pending: null });
  }

  return (
    <main className="final-result-screen">
      <div className="result-topbar">
        <Brand compact />
        <span className="complete-pill">
          <Icon name="check" size={14} />
          Both tiers complete
        </span>
      </div>
      <section className="final-result-hero">
        <span className="result-kicker">Combined assessment</span>
        <div className="final-score">
          <span>Final pattern match</span>
          <strong>{pct(t2.probability)}</strong>
          <small>{level} indication</small>
        </div>
        <h1>
          {elevated
            ? "Your combined results show a stronger pattern associated with endometriosis."
            : "Your combined results show fewer patterns commonly associated with endometriosis."}
        </h1>
        <p>This re-scores your symptom answers together with the CA-125 and CRP values from your hospital report.</p>
      </section>
      <section className="tier-summary-grid">
        <div className="tier-summary-card">
          <span className="summary-number">1</span>
          <div>
            <small>Tier 1</small>
            <strong>{pct(t1.probability)} match</strong>
            <p>Symptoms and health history</p>
          </div>
          <Icon name="check" size={17} />
        </div>
        <div className="tier-summary-card">
          <span className="summary-number">2</span>
          <div>
            <small>Tier 2</small>
            <strong>Results included</strong>
            <p>
              CA-125: {labs?.ca125} U/mL · CRP: {labs?.crp} mg/L
            </p>
          </div>
          <Icon name="check" size={17} />
        </div>
      </section>
      <section className="final-guidance">
        <span className="guidance-icon">
          <Icon name="shield" size={22} />
        </span>
        <div>
          <p className="eyebrow">What this means</p>
          <h2>Review this result with your clinician</h2>
          <p>
            Neither this result nor these blood markers can confirm endometriosis. A clinician may recommend examination, imaging, or other investigations based on your individual circumstances.
          </p>
        </div>
      </section>
      <div className="final-actions">
        <button type="button" className="primary-button" onClick={save}>
          Save final result
          <Icon name="arrow" size={19} />
        </button>
        <button type="button" className="secondary-button" onClick={() => shareSummary({ ...pending, date: new Date().toISOString() }, data.profile?.name)}>
          Prepare doctor summary
        </button>
      </div>
      <p className="result-disclaimer">{URGENT}</p>
    </main>
  );
}
