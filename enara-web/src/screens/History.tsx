import { useState } from "react";
import { AvatarMenu, BottomNav, Tab } from "../components/Nav";
import { Icon } from "../components/ui";
import { dayNumber, monthShort } from "../lib/dates";
import { headline, pct } from "../lib/scoring";
import { shareSummary } from "../lib/share";
import { useStore } from "../lib/store";

const FILTERS = ["All results", "Tier 1 only", "Combined only"] as const;

export function History({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const { data } = useStore();
  const [filter, setFilter] = useState(0);
  const all = data.results;
  const latest = all[0];
  const latestP = latest ? headline(latest.prediction).probability : 0;
  const shown = all.filter((r) => (filter === 1 ? !r.prediction.tier2 : filter === 2 ? !!r.prediction.tier2 : true));

  return (
    <main className="app-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your records</p>
          <h1>Assessment history</h1>
        </div>
        <AvatarMenu />
      </header>
      <section className="history-summary">
        <div>
          <strong>{all.length}</strong>
          <span>Assessments</span>
        </div>
        <div>
          <strong>{latest ? (latest.prediction.tier2 ? "2/2" : "1/2") : "—"}</strong>
          <span>Latest tiers</span>
        </div>
        <div>
          <strong>{latest ? pct(latestP) : "—"}</strong>
          <span>Latest match</span>
        </div>
      </section>
      <section className="timeline-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>Past results</h2>
          </div>
          <button type="button" className="filter-button" onClick={() => setFilter((filter + 1) % FILTERS.length)} aria-label={`Filter: ${FILTERS[filter]}`}>
            {FILTERS[filter]}
          </button>
        </div>
        {shown.length === 0 ? (
          <div className="empty-card" style={{ margin: 0 }}>
            {all.length ? "No results match this filter." : "Your saved assessments will appear here."}
          </div>
        ) : (
          <div className="history-list">
            {shown.map((r) => {
              const h = headline(r.prediction);
              const isLatest = r.id === latest.id;
              const isFirst = r.id === all[all.length - 1].id;
              const diff = Math.round(h.probability * 100) - Math.round(latestP * 100);
              return (
                <button
                  type="button"
                  key={r.id}
                  className={isLatest ? "history-card history-card-latest" : "history-card"}
                  onClick={() => shareSummary(r, data.profile?.name)}
                  title="Share a summary for your doctor"
                >
                  <div className="history-date">
                    <strong>{dayNumber(r.date)}</strong>
                    <span>{monthShort(r.date)}</span>
                  </div>
                  <div className="history-details">
                    {isLatest && <span className="latest-label">Latest assessment</span>}
                    <h3>{r.prediction.tier2 ? "Combined Tier 1 + 2" : isFirst && all.length > 1 ? "Initial assessment" : "Tier 1 screening"}</h3>
                    <p>
                      {h.level} indication · {pct(h.probability)} pattern match
                    </p>
                    {isLatest ? (
                      <div className="history-tags">
                        <span>Symptoms</span>
                        <span>Health history</span>
                        {r.prediction.tier2 && <span>Blood tests</span>}
                      </div>
                    ) : (
                      <span className="history-change">
                        {isFirst ? "First recorded result" : diff === 0 ? "Same as latest" : `${Math.abs(diff)} points ${diff < 0 ? "lower" : "higher"} than latest`}
                      </span>
                    )}
                  </div>
                  <Icon name="arrow" size={18} />
                </button>
              );
            })}
          </div>
        )}
      </section>
      <p className="page-disclaimer">Your assessment history helps you discuss changes over time with a healthcare professional.</p>
      <BottomNav active="history" onNavigate={onNavigate} />
    </main>
  );
}
