import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { completedLabel, greeting } from "../lib/dates";
import { headline, pct } from "../lib/scoring";
import { shareSummary } from "../lib/share";
import { useStore } from "../lib/store";
import { useTitle } from "../lib/useTitle";

export function Dashboard() {
  useTitle("Dashboard · Enara");
  const { data } = useStore();
  const rec = data.results[0];
  const name = data.profile?.name ?? "";
  const h = rec ? headline(rec.prediction) : null;
  const hasTierTwo = !!rec?.prediction.tier2;
  const canAddLabs = !!rec && !hasTierTwo && rec.prediction.tier1.elevated_risk;
  const symptoms = rec
    ? ([["Period pain", rec.answers.dysmenorrhea], ["Pelvic pain", rec.answers.pelvicPain], ["Pain during sex", rec.answers.dyspareunia], ["Bowel pain", rec.answers.dyschezia], ["Urinary", rec.answers.urinary]] as const)
    : [];

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Your health overview</p>
        <h1>
          {greeting()}
          {name ? `, ${name}` : ""}
        </h1>
        <p>{rec ? "Your assessment is saved privately in this browser." : "Take your first assessment to see your overview."}</p>
      </header>

      {!rec || !h ? (
        <section className="card empty-state">
          <h2>No assessments yet</h2>
          <p>The assessment takes about four minutes. Your answers are sent to the Enara service only to calculate a result, and your saved results stay in this browser.</p>
          <Link className="btn btn-primary" to="/check">
            Start assessment <Icon name="arrow" size={18} />
          </Link>
        </section>
      ) : (
        <div className="dash-grid">
          <section className="dash-hero">
            <div>
              <span className="card-kicker">{h.combined ? "Latest combined result" : "Latest Tier 1 result"}</span>
              <h2>{h.level} indication</h2>
              <p>{completedLabel(rec.date)}</p>
              <div className="card-actions">
                <button type="button" className="btn btn-light" onClick={() => shareSummary(rec, data.profile?.name)}>
                  Prepare doctor summary
                </button>
                <Link className="btn btn-ghost" to="/check">Retake assessment</Link>
              </div>
            </div>
            <div className="mini-score">
              <strong>{pct(h.probability)}</strong>
              <span>pattern match</span>
            </div>
          </section>

          <section className="card span-7">
            <div className="card-head">
              <div>
                <p className="eyebrow">Testing pathway</p>
                <h2>Your next step</h2>
              </div>
              <span className="step-count">{hasTierTwo ? "2 of 2" : "1 of 2"}</span>
            </div>
            <ol className="pathway">
              <li className="done">
                <span className="dot"><Icon name="check" size={16} /></span>
                <div><strong>Tier 1 · Health assessment</strong><small>Symptoms, cycle, history and wellbeing</small></div>
              </li>
              <li className={hasTierTwo ? "done" : ""}>
                <span className="dot">{hasTierTwo ? <Icon name="check" size={16} /> : "2"}</span>
                <div><strong>Tier 2 · Hospital blood tests</strong><small>Adds CA-125 and CRP results</small></div>
              </li>
            </ol>
            {hasTierTwo && rec.labs ? (
              <div className="lab-boxes">
                <div><span>CA-125</span><strong>{rec.labs.ca125} U/mL</strong></div>
                <div><span>CRP</span><strong>{rec.labs.crp} mg/L</strong></div>
              </div>
            ) : canAddLabs ? (
              <Link className="btn btn-primary" to="/tier2">
                Add hospital test results <Icon name="arrow" size={18} />
              </Link>
            ) : (
              <p className="muted-note">Tier 2 isn’t suggested because your Tier 1 result was lower. Retake the assessment if your symptoms change.</p>
            )}
          </section>

          <section className="card span-5">
            <div className="card-head">
              <div>
                <p className="eyebrow">Your data</p>
                <h2>Symptom snapshot</h2>
              </div>
              <span className="scale-caption">out of 10</span>
            </div>
            <div className="symptoms">
              {symptoms.map(([label, value]) => (
                <div className="symptom-row" key={label}>
                  <span>{label}</span>
                  <div className="bar"><i style={{ width: `${value * 10}%` }} /></div>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="card span-12">
            <p className="eyebrow">Health details</p>
            <div className="detail-grid">
              <div><span>Age</span><strong>{rec.answers.age || "—"}</strong></div>
              <div><span>BMI</span><strong>{rec.answers.bmi || "—"}</strong></div>
              <div><span>Cycle length</span><strong>{rec.answers.cycleLength || "—"} days</strong></div>
              <div><span>First period</span><strong>Age {rec.answers.menarcheAge || "—"}</strong></div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
