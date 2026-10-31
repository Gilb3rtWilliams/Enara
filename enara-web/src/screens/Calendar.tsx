import { useMemo, useState } from "react";
import { BottomNav, Tab } from "../components/Nav";
import { Icon } from "../components/ui";
import { cycleInfo, monthGrid, predictedDays } from "../lib/cycle";
import { MONTH_NAMES, ymd } from "../lib/dates";
import { useStore } from "../lib/store";
import { CheckIn } from "../lib/types";


const FLOW = ["None", "Light", "Medium", "Heavy"];
const PAIN = ["None", "Mild", "Moderate", "Severe"];
const MOOD = ["Good", "Okay", "Low"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function Calendar({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const { data, update } = useStore();
  const today = useMemo(() => new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), []);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const cycleLength = useMemo(() => {
    const n = Number(data.results[0]?.answers.cycleLength || data.draft.cycleLength);
    return n >= 15 && n <= 60 ? n : 28;
  }, [data.results, data.draft.cycleLength]);

  const periodSet = useMemo(() => new Set(data.cycle.periodDays), [data.cycle.periodDays]);
  const info = useMemo(() => cycleInfo(data.cycle.periodDays, cycleLength, today), [data.cycle.periodDays, cycleLength, today]);
  const predicted = useMemo(() => predictedDays(info, today), [info, today]);
  const grid = useMemo(() => monthGrid(view.y, view.m), [view]);
  const todayKey = ymd(today);
  const checkin: CheckIn = data.cycle.checkins[todayKey] ?? {};

  const shiftMonth = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const togglePeriod = (key: string) =>
    update((d) => {
      const has = d.cycle.periodDays.includes(key);
      return { ...d, cycle: { ...d.cycle, periodDays: has ? d.cycle.periodDays.filter((x) => x !== key) : [...d.cycle.periodDays, key] } };
    });

  const cycleValue = (field: keyof CheckIn, count: number) =>
    update((d) => {
      const cur = d.cycle.checkins[todayKey] ?? {};
      const next = cur[field] === undefined ? 0 : (cur[field]! + 1) % count;
      return { ...d, cycle: { ...d.cycle, checkins: { ...d.cycle.checkins, [todayKey]: { ...cur, [field]: next } } } };
    });

  const next = info
    ? info.daysUntil > 0 ? `${info.daysUntil} day${info.daysUntil === 1 ? "" : "s"}` : info.daysUntil === 0 ? "Today" : `${-info.daysUntil} days late`
    : "—";
  const nextDate = info ? `${MONTH_NAMES[info.nextStart.getMonth()]} ${info.nextStart.getDate()}` : "";
  const val = (list: string[], v: number | undefined) => (v === undefined ? "Click to log" : list[v]);

  return (
    <main className="app-page calendar-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Cycle tracker</p>
          <h1>
            {MONTH_NAMES[view.m]} {view.y}
          </h1>
        </div>
        <button type="button" className="today-button" onClick={() => setView({ y: today.getFullYear(), m: today.getMonth() })}>
          Today
        </button>
      </header>

      <section className="cycle-overview">
        <div className="cycle-orb">
          <span>Cycle day</span>
          <strong>{info ? info.cycleDay : "—"}</strong>
          <small>{info ? info.phase : "Log a period"}</small>
        </div>
        <div className="cycle-copy">
          <p className="eyebrow">Next period</p>
          <h2>{next}</h2>
          <p>{info ? `Expected around ${nextDate}` : "Tap a day below to log your period."}</p>
        </div>
      </section>

      <section className="calendar-card">
        <div className="nav-arrows">
          <button type="button" className="icon-button" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
            <Icon name="back" />
          </button>
          <span>Tap a day to log your period</span>
          <button type="button" className="icon-button" aria-label="Next month" onClick={() => shiftMonth(1)}>
            <Icon name="arrow" />
          </button>
        </div>
        <div className="calendar-weekdays">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {grid.map(({ date, outside }) => {
            const key = ymd(date);
            const isPeriod = periodSet.has(key);
            const isPredicted = !isPeriod && predicted.has(key);
            const isToday = key === todayKey;
            const future = date > today;
            return (
              <button
                type="button"
                key={key}
                disabled={future}
                onClick={() => togglePeriod(key)}
                className={["calendar-day day-button", outside ? "day-outside" : "", isPeriod ? "day-period" : "", isPredicted ? "day-predicted" : "", isToday ? "day-today" : ""].join(" ")}
                aria-label={`${MONTH_NAMES[date.getMonth()]} ${date.getDate()}${isPeriod ? ", period day" : isPredicted ? ", predicted period day" : ""}`}
                aria-pressed={isPeriod}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
        <div className="calendar-legend">
          <span>
            <i className="legend-period" /> Period
          </span>
          <span>
            <i className="legend-predicted" /> Predicted
          </span>
        </div>
      </section>

      <section className="log-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{`Today · ${MONTH_NAMES[today.getMonth()].slice(0, 3)} ${today.getDate()}`}</p>
            <h2>Daily check-in</h2>
          </div>
          <button type="button" className="add-log-button" onClick={() => togglePeriod(todayKey)}>
            {periodSet.has(todayKey) ? "Unmark period" : "Period today"}
          </button>
        </div>
        <div className="check-in-grid">
          <button type="button" onClick={() => cycleValue("flow", FLOW.length)} aria-label={`Flow: ${val(FLOW, checkin.flow)}`}>
            <span className="check-in-icon">01</span>
            <strong>Flow</strong>
            <small>{val(FLOW, checkin.flow)}</small>
          </button>
          <button type="button" onClick={() => cycleValue("pain", PAIN.length)} aria-label={`Pain: ${val(PAIN, checkin.pain)}`}>
            <span className="check-in-icon">02</span>
            <strong>Pain</strong>
            <small>{val(PAIN, checkin.pain)}</small>
          </button>
          <button type="button" onClick={() => cycleValue("mood", MOOD.length)} aria-label={`Mood: ${val(MOOD, checkin.mood)}`}>
            <span className="check-in-icon">03</span>
            <strong>Mood</strong>
            <small>{val(MOOD, checkin.mood)}</small>
          </button>
        </div>
      </section>
      <p className="page-disclaimer">Predictions are estimates based on the periods you log and your cycle length. They are not medical advice.</p>
      <BottomNav active="calendar" onNavigate={onNavigate} />
    </main>
  );
}
