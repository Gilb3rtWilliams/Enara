import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { dayNumber, monthShort } from "../lib/dates";
import { headline, pct } from "../lib/scoring";
import { shareSummary } from "../lib/share";
import { useStore } from "../lib/store";
import { useTitle } from "../lib/useTitle";

const FILTERS = ["All results", "Tier 1 only", "Combined only"] as const;

export function History() {
  useTitle("History · Enara");
  const { data } = useStore();
  const [filter, setFilter] = useState(0);
  const all = data.results;
  const latest = all[0];
  const latestP = latest ? headline(latest.prediction).probability : 0;
  const shown = all.filter((r) => (filter === 1 ? !r.prediction.tier2 : filter === 2 ? !!r.prediction.tier2 : true));

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Your records</p>
        <h1>Assessment history</h1>
        <p>Your history helps you discuss changes over time with a healthcare professional.</p>
      </header>

      <section className="stat-row">
        <div className="stat"><strong>{all.length}</strong><span>Assessments</span></div>
        <div className="stat"><strong>{latest ? (latest.prediction.tier2 ? "2/2" : "1/2") : "—"}</strong><span>Latest tiers</span></div>
        <div className="stat"><strong>{latest ? pct(latestP) : "—"}</strong><span>Latest match</span></div>
      </section>

      <div className="section-bar">
        <h2>Past results</h2>
        <div className="filters" role="group" aria-label="Filter results">
          {FILTERS.map((f, i) => (
            <button key={f} type="button" className={filter === i ? "chip chip-on" : "chip"} aria-pressed={filter === i} onClick={() => setFilter(i)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <section className="card empty-state">
          <p>{all.length ? "No results match this filter." : "Your saved assessments will appear here."}</p>
          {!all.length && (
            <Link className="btn btn-primary" to="/check">
              Start assessment <Icon name="arrow" size={18} />
            </Link>
          )}
        </section>
      ) : (
        <div className="history-grid">
          {shown.map((r) => {
            const h = headline(r.prediction);
            const isLatest = r.id === latest.id;
            const isFirst = r.id === all[all.length - 1].id;
            const diff = Math.round(h.probability * 100) - Math.round(latestP * 100);
            return (
              <button
                type="button"
                key={r.id}
                className={isLatest ? "history-card latest" : "history-card"}
                onClick={() => shareSummary(r, data.profile?.name)}
                title="Share a summary for your doctor"
              >
                <div className="history-date"><strong>{dayNumber(r.date)}</strong><span>{monthShort(r.date)}</span></div>
                <div className="history-body">
                  {isLatest && <span className="latest-label">Latest assessment</span>}
                  <h3>{r.prediction.tier2 ? "Combined Tier 1 + 2" : isFirst && all.length > 1 ? "Initial assessment" : "Tier 1 screening"}</h3>
                  <p>{h.level} indication · {pct(h.probability)} pattern match</p>
                  {isLatest ? (
                    <div className="tags"><span>Symptoms</span><span>Health history</span>{r.prediction.tier2 && <span>Blood tests</span>}</div>
                  ) : (
                    <small>{isFirst ? "First recorded result" : diff === 0 ? "Same as latest" : `${Math.abs(diff)} points ${diff < 0 ? "lower" : "higher"} than latest`}</small>
                  )}
                </div>
                <Icon name="arrow" size={18} />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
