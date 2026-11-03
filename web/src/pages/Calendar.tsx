import { useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import { cycleInfo, monthGrid, predictedDays } from "../lib/cycle";
import { MONTH_NAMES, ymd } from "../lib/dates";
import { useStore } from "../lib/store";
import { CheckIn } from "../lib/types";
import { useTitle } from "../lib/useTitle";

const FLOW = ["None", "Light", "Medium", "Heavy"];
const PAIN = ["None", "Mild", "Moderate", "Severe"];
const MOOD = ["Good", "Okay", "Low"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function Calendar() {
  useTitle("Cycle calendar · Enara");
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
    <>
      <header className="page-head">
        <p className="eyebrow">Cycle tracker</p>
        <h1>{MONTH_NAMES[view.m]} {view.y}</h1>
        <p>Click a day to log or unmark your period. Predictions are estimates, not medical advice.</p>
      </header>

      <div className="cal-layout">
        <section className="card cal-card">
          <div className="cal-toolbar">
            <div className="cal-nav">
              <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => shiftMonth(-1)}><Icon name="back" /></button>
              <button type="button" className="icon-btn" aria-label="Next month" onClick={() => shiftMonth(1)}><Icon name="arrow" /></button>
            </div>
            <button type="button" className="chip" onClick={() => setView({ y: today.getFullYear(), m: today.getMonth() })}>Today</button>
          </div>
          <div className="cal-weekdays">{WEEKDAYS.map((d) => <span key={d}>{d}</span>)}</div>
          <div className="cal-grid">
            {grid.map(({ date, outside }) => {
              const key = ymd(date);
              const isPeriod = periodSet.has(key);
              const isPredicted = !isPeriod && predicted.has(key);
              const isToday = key === todayKey;
              return (
                <button
                  type="button"
                  key={key}
                  disabled={date > today}
                  onClick={() => togglePeriod(key)}
                  className={["cal-day", outside ? "outside" : "", isPeriod ? "period" : "", isPredicted ? "predicted" : "", isToday ? "today" : ""].join(" ")}
                  aria-label={`${MONTH_NAMES[date.getMonth()]} ${date.getDate()}${isPeriod ? ", period day" : isPredicted ? ", predicted period day" : ""}`}
                  aria-pressed={isPeriod}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="cal-legend">
            <span><i className="lg-period" /> Period</span>
            <span><i className="lg-predicted" /> Predicted</span>
          </div>
        </section>

        <div className="cal-side">
          <section className="cycle-card">
            <div className="orb">
              <small>Cycle day</small>
              <strong>{info ? info.cycleDay : "—"}</strong>
              <small>{info ? info.phase : "Log a period"}</small>
            </div>
            <div>
              <span className="card-kicker">Next period</span>
              <h2>{next}</h2>
              <p>{info ? `Expected around ${nextDate}` : "Click a day to log your period."}</p>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div>
                <p className="eyebrow">{`Today · ${MONTH_NAMES[today.getMonth()].slice(0, 3)} ${today.getDate()}`}</p>
                <h2>Daily check-in</h2>
              </div>
              <button type="button" className="chip" onClick={() => togglePeriod(todayKey)}>
                {periodSet.has(todayKey) ? "Unmark period" : "Period today"}
              </button>
            </div>
            <div className="checkin-grid">
              <button type="button" onClick={() => cycleValue("flow", FLOW.length)} aria-label={`Flow: ${val(FLOW, checkin.flow)}`}>
                <span>01</span><strong>Flow</strong><small>{val(FLOW, checkin.flow)}</small>
              </button>
              <button type="button" onClick={() => cycleValue("pain", PAIN.length)} aria-label={`Pain: ${val(PAIN, checkin.pain)}`}>
                <span>02</span><strong>Pain</strong><small>{val(PAIN, checkin.pain)}</small>
              </button>
              <button type="button" onClick={() => cycleValue("mood", MOOD.length)} aria-label={`Mood: ${val(MOOD, checkin.mood)}`}>
                <span>03</span><strong>Mood</strong><small>{val(MOOD, checkin.mood)}</small>
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
