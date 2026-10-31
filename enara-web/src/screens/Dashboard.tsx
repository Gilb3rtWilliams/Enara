import { AvatarMenu, BottomNav, Tab } from "../components/Nav";
import { Brand, Icon } from "../components/ui";
import { completedLabel, greeting } from "../lib/dates";
import { useFlow } from "../lib/flow";
import { headline, pct } from "../lib/scoring";
import { useStore } from "../lib/store";

export function Dashboard({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const { go } = useFlow();
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
    <main className="dashboard">
      <header className="dashboard-header">
        <Brand compact />
        <AvatarMenu />
      </header>
      <section className="dashboard-intro">
        <p className="eyebrow">Your health overview</p>
        <h1>
          {greeting()}
          {name ? `, ${name}` : ""}
        </h1>
        <p>{rec ? "Your assessment is saved privately in this browser." : "Take your first assessment to see your overview."}</p>
      </section>

      {rec && h ? (
        <>
          <section className="dashboard-result-card">
            <div>
              <span className="card-kicker">{h.combined ? "Latest combined result" : "Latest Tier 1 result"}</span>
              <strong>{h.level} indication</strong>
              <small>{completedLabel(rec.date)}</small>
            </div>
            <div className="mini-score">
              <strong>{pct(h.probability)}</strong>
              <span>match</span>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Testing pathway</p>
                <h2>Your next step</h2>
              </div>
              <span className="step-count">{hasTierTwo ? "2 of 2" : "1 of 2"}</span>
            </div>
            <div className="tier-list">
              <div className="tier-row tier-complete">
                <span className="tier-status">
                  <Icon name="check" size={16} />
                </span>
                <div>
                  <strong>Tier 1 · Health assessment</strong>
                  <p>Symptoms, cycle, history and wellbeing</p>
                </div>
              </div>
              <div className={hasTierTwo ? "tier-row tier-complete" : "tier-row"}>
                <span className="tier-status">{hasTierTwo ? <Icon name="check" size={16} /> : "2"}</span>
                <div>
                  <strong>Tier 2 · Hospital blood tests</strong>
                  <p>Adds CA-125 and CRP results</p>
                </div>
              </div>
            </div>
            {hasTierTwo && rec.labs ? (
              <div className="lab-results">
                <div>
                  <span>CA-125</span>
                  <strong>{rec.labs.ca125} U/mL</strong>
                </div>
                <div>
                  <span>CRP</span>
                  <strong>{rec.labs.crp} mg/L</strong>
                </div>
              </div>
            ) : canAddLabs ? (
              <button type="button" className="primary-button" onClick={() => go("tier2")}>
                Add hospital test results
                <Icon name="arrow" size={19} />
              </button>
            ) : (
              <p className="tier-none-note">Tier 2 isn’t suggested because your Tier 1 result was lower. Retake the assessment if your symptoms change.</p>
            )}
          </section>

          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Your data</p>
                <h2>Symptom snapshot</h2>
              </div>
              <span className="scale-caption">out of 10</span>
            </div>
            <div className="symptom-list">
              {symptoms.map(([label, value]) => (
                <div className="symptom-row" key={label}>
                  <span>{label}</span>
                  <div className="symptom-track">
                    <span className={`symptom-fill symptom-fill-${value}`} />
                  </div>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-section details-card">
            <p className="eyebrow">Health details</p>
            <div className="detail-grid">
              <div>
                <span>Age</span>
                <strong>{rec.answers.age || "—"}</strong>
              </div>
              <div>
                <span>BMI</span>
                <strong>{rec.answers.bmi || "—"}</strong>
              </div>
              <div>
                <span>Cycle</span>
                <strong>{rec.answers.cycleLength || "—"} days</strong>
              </div>
              <div>
                <span>First period</span>
                <strong>Age {rec.answers.menarcheAge || "—"}</strong>
              </div>
            </div>
          </section>

          <button type="button" className="dashboard-retake text-button" onClick={() => go("assessment", { section: 0 })}>
            Retake Tier 1 assessment
          </button>
        </>
      ) : (
        <section className="empty-card">
          <h2>No assessments yet</h2>
          <p>The assessment takes about four minutes. Your answers are sent to the Enara service only to calculate a result, and your saved results stay in this browser.</p>
          <button type="button" className="primary-button" onClick={() => go("assessment", { section: 0 })}>
            Start assessment
            <Icon name="arrow" size={19} />
          </button>
        </section>
      )}
      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </main>
  );
}
