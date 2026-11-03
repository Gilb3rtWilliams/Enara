import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../components/Icon";
import { Avatar, BottomNav, TabId } from "../components/parts";
import { Screen } from "../components/Screen";
import { Eyebrow, H1, H2 } from "../components/ui";
import { dayNumber, monthShort } from "../dates";
import { headline, pct } from "../scoring";
import { shareSummary } from "../state/actions";
import { useStore } from "../state/store";
import { colors, fonts } from "../theme";
import { AccountMenu, PAGE_BG } from "./Dashboard";

const FILTERS = ["All results", "Tier 1 only", "Combined only"] as const;

export function History({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const { data } = useStore();
  const insets = useSafeAreaInsets();
  const openMenu = AccountMenu();
  const [filter, setFilter] = useState(0);
  const all = data.results;
  const latest = all[0];
  const latestP = latest ? headline(latest.prediction).probability : 0;

  const shown = all.filter((r) => (filter === 1 ? !r.prediction.tier2 : filter === 2 ? !!r.prediction.tier2 : true));

  return (
    <View style={{ flex: 1, backgroundColor: PAGE_BG }}>
      <Screen topInset contentStyle={{ paddingBottom: 118 + insets.bottom, backgroundColor: PAGE_BG }}>
        <View style={s.pageHeader}>
          <View style={{ flex: 1 }}>
            <Eyebrow style={{ marginBottom: 6 }}>Your records</Eyebrow>
            <H1 style={s.title}>Assessment history</H1>
          </View>
          <Avatar name={data.profile?.name ?? ""} onPress={openMenu} />
        </View>

        <View style={s.summary}>
          <Stat value={String(all.length)} label="Assessments" />
          <Stat value={latest ? (latest.prediction.tier2 ? "2/2" : "1/2") : "—"} label="Latest tiers" divider />
          <Stat value={latest ? pct(latestP) : "—"} label="Latest match" divider />
        </View>

        <View style={{ marginHorizontal: 24 }}>
          <View style={s.heading}>
            <View>
              <Eyebrow style={{ marginBottom: 4 }}>Timeline</Eyebrow>
              <H2 style={{ fontSize: 21, lineHeight: 25 }}>Past results</H2>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Filter: ${FILTERS[filter]}`} onPress={() => setFilter((filter + 1) % FILTERS.length)} style={s.filter}>
              <Text style={s.filterText}>{FILTERS[filter]}</Text>
            </Pressable>
          </View>

          {shown.length === 0 ? (
            <View style={s.card}>
              <Text style={s.empty}>{all.length ? "No results match this filter." : "Your saved assessments will appear here."}</Text>
            </View>
          ) : (
            <View style={{ gap: 11 }}>
              {shown.map((r) => {
                const h = headline(r.prediction);
                const isLatest = r.id === latest.id;
                const isFirst = r.id === all[all.length - 1].id;
                const diff = Math.round(h.probability * 100) - Math.round(latestP * 100);
                return (
                  <Pressable
                    key={r.id}
                    accessibilityRole="button"
                    accessibilityHint="Opens the share sheet with a summary for your doctor"
                    onPress={() => shareSummary(r, data.profile?.name)}
                    style={[s.card, s.item, isLatest && s.itemLatest]}
                  >
                    <View style={s.date}>
                      <Text style={s.dateDay}>{dayNumber(r.date)}</Text>
                      <Text style={s.dateMonth}>{monthShort(r.date).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      {isLatest ? <Text style={s.latestLabel}>LATEST ASSESSMENT</Text> : null}
                      <Text style={s.itemTitle}>{r.prediction.tier2 ? "Combined Tier 1 + 2" : isFirst && all.length > 1 ? "Initial assessment" : "Tier 1 screening"}</Text>
                      <Text style={s.itemP}>{h.level} indication · {pct(h.probability)} pattern match</Text>
                      {isLatest ? (
                        <View style={s.tags}>
                          <Tag text="Symptoms" />
                          <Tag text="Health history" />
                          {r.prediction.tier2 ? <Tag text="Blood tests" /> : null}
                        </View>
                      ) : (
                        <Text style={s.change}>
                          {isFirst ? "First recorded result" : diff === 0 ? "Same as latest" : `${Math.abs(diff)} points ${diff < 0 ? "lower" : "higher"} than latest`}
                        </Text>
                      )}
                    </View>
                    <Icon name="arrow" size={18} color="#968b93" />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Text style={s.disclaimer}>Your assessment history helps you discuss changes over time with a healthcare professional.</Text>
      </Screen>
      <BottomNav active="history" onNavigate={onNavigate} />
    </View>
  );
}

function Stat({ value, label, divider }: { value: string; label: string; divider?: boolean }) {
  return (
    <View style={[s.stat, divider && { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.18)" }]}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const Tag = ({ text }: { text: string }) => (
  <View style={s.tag}><Text style={s.tagText}>{text}</Text></View>
);

const s = StyleSheet.create({
  pageHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 20, paddingTop: 30, paddingHorizontal: 24, paddingBottom: 22 },
  title: { fontSize: 30, lineHeight: 34.5, letterSpacing: -0.5 },
  summary: {
    flexDirection: "row", marginHorizontal: 24, marginBottom: 24, paddingVertical: 18, paddingHorizontal: 8, borderRadius: 19, backgroundColor: colors.plum,
    shadowColor: colors.plum, shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 13 }, elevation: 8,
  },
  stat: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { color: colors.white, fontFamily: fonts.display, fontSize: 20 },
  statLabel: { color: "#d9cad3", fontFamily: fonts.semibold, fontSize: 8 },
  heading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 15, marginBottom: 18 },
  filter: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 11, backgroundColor: colors.lilac },
  filterText: { color: colors.plum, fontFamily: fonts.bold, fontSize: 10 },
  card: { padding: 17, borderWidth: 1, borderColor: colors.line, borderRadius: 18, backgroundColor: colors.white },
  empty: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, textAlign: "center" },
  item: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemLatest: { borderColor: "#d6c2d0", shadowColor: colors.plumDark, shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  date: { width: 42, height: 48, borderRadius: 12, backgroundColor: "#f4eef2", alignItems: "center", justifyContent: "center" },
  dateDay: { color: colors.plum, fontFamily: fonts.display, fontSize: 17, lineHeight: 18 },
  dateMonth: { color: "#998d95", fontFamily: fonts.body, fontSize: 8 },
  latestLabel: { color: colors.rose, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 0.56 },
  itemTitle: { marginTop: 3, marginBottom: 4, color: "#50454e", fontFamily: fonts.bold, fontSize: 13 },
  itemP: { color: "#91868e", fontFamily: fonts.body, fontSize: 9 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 9 },
  tag: { paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6, backgroundColor: "#f5f0f3" },
  tagText: { color: "#8e818a", fontFamily: fonts.body, fontSize: 8 },
  change: { marginTop: 8, color: "#8e818a", fontFamily: fonts.body, fontSize: 8 },
  disclaimer: { marginTop: 24, marginHorizontal: 35, textAlign: "center", color: "#978d94", fontFamily: fonts.body, fontSize: 9, lineHeight: 13.5 },
});
