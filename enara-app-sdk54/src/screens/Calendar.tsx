import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glow } from "../components/Glow";
import { IconButton } from "../components/ui";
import { BottomNav, TabId } from "../components/parts";
import { Screen } from "../components/Screen";
import { Eyebrow, H1, H2 } from "../components/ui";
import { cycleInfo, monthGrid, predictedDays } from "../cycle";
import { MONTH_NAMES, ymd } from "../dates";
import { useStore } from "../state/store";
import { colors, fonts } from "../theme";
import { CheckIn } from "../types";
import { PAGE_BG } from "./Dashboard";

const FLOW = ["None", "Light", "Medium", "Heavy"];
const PAIN = ["None", "Mild", "Moderate", "Severe"];
const MOOD = ["Good", "Okay", "Low"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function Calendar({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const { data, update } = useStore();
  const insets = useSafeAreaInsets();
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

  return (
    <View style={{ flex: 1, backgroundColor: PAGE_BG }}>
      <Screen topInset contentStyle={{ paddingBottom: 118 + insets.bottom, backgroundColor: PAGE_BG }}>
        <View style={s.pageHeader}>
          <View style={{ flex: 1 }}>
            <Eyebrow style={{ marginBottom: 6 }}>Cycle tracker</Eyebrow>
            <H1 style={s.title}>{MONTH_NAMES[view.m]} {view.y}</H1>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setView({ y: today.getFullYear(), m: today.getMonth() })} style={s.pillButton}>
            <Text style={s.pillText}>Today</Text>
          </Pressable>
        </View>

        <View style={s.overview}>
          <Glow cx={0.1} cy={0.2} r={0.38} alpha={0.15} />
          <View style={s.orb}>
            <Text style={s.orbSmall}>Cycle day</Text>
            <Text style={s.orbValue}>{info ? info.cycleDay : "—"}</Text>
            <Text style={s.orbSmall}>{info ? info.phase : "Log a period"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.nextEyebrow}>NEXT PERIOD</Text>
            <Text style={s.nextValue}>{next}</Text>
            <Text style={s.nextSub}>{info ? `Expected around ${nextDate}` : "Tap a day below to log your period."}</Text>
          </View>
        </View>

        <View style={s.calendarCard}>
          <View style={s.monthRow}>
            <IconButton icon="back" label="Previous month" onPress={() => shiftMonth(-1)} />
            <Text style={s.monthHint}>Tap a day to log your period</Text>
            <IconButton icon="arrow" label="Next month" onPress={() => shiftMonth(1)} />
          </View>
          <View style={s.week}>
            {WEEKDAYS.map((d) => (
              <Text key={d} style={s.weekday}>{d.toUpperCase()}</Text>
            ))}
          </View>
          <View style={s.grid}>
            {grid.map(({ date, outside }) => {
              const key = ymd(date);
              const isToday = key === todayKey;
              const isPeriod = periodSet.has(key);
              const isPredicted = !isPeriod && predicted.has(key);
              const future = date > today;
              return (
                <View key={key} style={s.cell}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${MONTH_NAMES[date.getMonth()]} ${date.getDate()}${isPeriod ? ", period day" : isPredicted ? ", predicted period day" : ""}`}
                    accessibilityHint={future ? undefined : "Toggles a period day"}
                    disabled={future}
                    onPress={() => togglePeriod(key)}
                    style={[s.day, isPeriod && s.dayPeriod, isPredicted && s.dayPredicted, isToday && s.dayToday]}
                  >
                    <Text style={[s.dayText, outside && { color: "#c8c0c5" }, (isPeriod || isPredicted) && { color: "#8b4052" }, isToday && { color: colors.white }]}>{date.getDate()}</Text>
                    {isPeriod && !isToday ? <View style={s.dot} /> : null}
                  </Pressable>
                </View>
              );
            })}
          </View>
          <View style={s.legend}>
            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: "#e7b7c2" }]} /><Text style={s.legendText}>Period</Text></View>
            <View style={s.legendItem}><View style={[s.legendDot, { borderWidth: 1, borderStyle: "dashed", borderColor: "#bd8191" }]} /><Text style={s.legendText}>Predicted</Text></View>
          </View>
        </View>

        <View style={s.log}>
          <View style={s.logHeading}>
            <View>
              <Eyebrow style={{ marginBottom: 4 }}>{`Today · ${MONTH_NAMES[today.getMonth()].slice(0, 3)} ${today.getDate()}`}</Eyebrow>
              <H2 style={{ fontSize: 21, lineHeight: 25 }}>Daily check-in</H2>
            </View>
            <Pressable accessibilityRole="button" onPress={() => togglePeriod(todayKey)} style={s.pillButton}>
              <Text style={s.pillText}>{periodSet.has(todayKey) ? "Unmark period" : "Period today"}</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Tile n="01" title="Flow" value={checkin.flow === undefined ? "Tap to log" : FLOW[checkin.flow]} onPress={() => cycleValue("flow", FLOW.length)} />
            <Tile n="02" title="Pain" value={checkin.pain === undefined ? "Tap to log" : PAIN[checkin.pain]} onPress={() => cycleValue("pain", PAIN.length)} />
            <Tile n="03" title="Mood" value={checkin.mood === undefined ? "Tap to log" : MOOD[checkin.mood]} onPress={() => cycleValue("mood", MOOD.length)} />
          </View>
        </View>
        <Text style={s.disclaimer}>Predictions are estimates based on the periods you log and your cycle length. They are not medical advice.</Text>
      </Screen>
      <BottomNav active="calendar" onNavigate={onNavigate} />
    </View>
  );
}

function Tile({ n, title, value, onPress }: { n: string; title: string; value: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}: ${value}`} onPress={onPress} style={s.tile}>
      <View style={s.tileIcon}><Text style={s.tileIconText}>{n}</Text></View>
      <Text style={s.tileTitle}>{title}</Text>
      <Text style={s.tileValue}>{value}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  pageHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 30, paddingHorizontal: 24, paddingBottom: 22 },
  title: { fontSize: 30, lineHeight: 34.5, letterSpacing: -0.5 },
  pillButton: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 11, backgroundColor: colors.lilac },
  pillText: { color: colors.plum, fontFamily: fonts.bold, fontSize: 10 },
  overview: {
    flexDirection: "row", alignItems: "center", gap: 22, marginHorizontal: 24, marginBottom: 18, padding: 20, borderRadius: 21, backgroundColor: colors.plum, overflow: "hidden",
    shadowColor: colors.plum, shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 13 }, elevation: 8,
  },
  orb: { width: 92, height: 92, borderRadius: 46, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.09)", alignItems: "center", justifyContent: "center" },
  orbSmall: { color: "#dacbd4", fontFamily: fonts.body, fontSize: 8, textAlign: "center" },
  orbValue: { color: colors.white, fontFamily: fonts.display, fontSize: 28, lineHeight: 31 },
  nextEyebrow: { color: "#dcb4c0", fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.56, marginBottom: 4 },
  nextValue: { color: colors.white, fontFamily: fonts.display, fontSize: 24, marginBottom: 4 },
  nextSub: { color: "#d8c7d1", fontFamily: fonts.body, fontSize: 9 },
  calendarCard: { marginVertical: 18, marginHorizontal: 24, paddingTop: 18, paddingHorizontal: 14, paddingBottom: 15, borderWidth: 1, borderColor: colors.line, borderRadius: 20, backgroundColor: colors.white },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8, marginTop: -6 },
  monthHint: { color: "#a2979f", fontFamily: fonts.body, fontSize: 10 },
  week: { flexDirection: "row", marginBottom: 9 },
  weekday: { flex: 1, textAlign: "center", color: "#a2979f", fontFamily: fonts.bold, fontSize: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, alignItems: "center", paddingVertical: 2.5 },
  day: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent" },
  dayText: { color: "#625761", fontFamily: fonts.semibold, fontSize: 10 },
  dayPeriod: { backgroundColor: "#f4dfe4" },
  dayPredicted: { borderStyle: "dashed", borderColor: "#bd8191" },
  dayToday: { backgroundColor: colors.plum, shadowColor: colors.plum, shadowOpacity: 0.22, shadowRadius: 5, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  dot: { position: "absolute", bottom: 4, width: 3, height: 3, borderRadius: 2, backgroundColor: "#ae6073" },
  legend: { flexDirection: "row", justifyContent: "center", gap: 18, marginTop: 15, paddingTop: 13, borderTopWidth: 1, borderTopColor: "#f0eaee" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: "#8f858c", fontFamily: fonts.body, fontSize: 8 },
  log: { marginHorizontal: 24, padding: 19, borderWidth: 1, borderColor: colors.line, borderRadius: 20, backgroundColor: colors.white },
  logHeading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 15, marginBottom: 18 },
  tile: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 13, backgroundColor: "#faf6f8" },
  tileIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: colors.lilac, alignItems: "center", justifyContent: "center" },
  tileIconText: { color: colors.plum, fontFamily: fonts.bold, fontSize: 8 },
  tileTitle: { color: "#5c5059", fontFamily: fonts.bold, fontSize: 10 },
  tileValue: { color: "#9b9198", fontFamily: fonts.body, fontSize: 8 },
  disclaimer: { marginTop: 18, marginHorizontal: 35, textAlign: "center", color: "#978d94", fontFamily: fonts.body, fontSize: 9, lineHeight: 13.5 },
});
