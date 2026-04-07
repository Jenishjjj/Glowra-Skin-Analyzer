import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, ScanResult } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function ScanHistoryCard({ scan, onPress }: { scan: ScanResult; onPress: () => void }) {
  const colors = useColors();
  const scoreColor = scan.skinScore >= 8 ? "#4CAF50" : scan.skinScore >= 6 ? colors.gold : colors.primary;
  const date = new Date(scan.date);
  const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const metricDots = [
    { val: scan.hydration, color: "#60B4FF" },
    { val: scan.pigmentation, color: "#A78BFA" },
    { val: scan.texture, color: "#4CAF50" },
    { val: scan.pores, color: colors.primary },
  ];

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={onPress} activeOpacity={0.85}>
      {/* Score circle */}
      <View style={styles.cardLeft}>
        <LinearGradient colors={[scoreColor + "25", scoreColor + "08"]} style={styles.scoreCircle}>
          <Text style={[styles.scoreNum, { color: scoreColor }]}>{scan.skinScore}</Text>
          <Text style={[styles.scoreOf, { color: colors.taupe }]}>/10</Text>
        </LinearGradient>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.dateRow}>
          <Text style={[styles.dateText, { color: colors.foreground }]}>{formatted}</Text>
          <Text style={[styles.timeText, { color: colors.taupeLight }]}>{time}</Text>
        </View>
        <Text style={[styles.ageText, { color: colors.taupe }]}>
          Skin {scan.skinAge} · Actual {scan.actualAge}
        </Text>
        {/* Metric mini bars */}
        <View style={styles.miniBarRow}>
          {metricDots.map((m, i) => (
            <View key={i} style={[styles.miniBarTrack, { backgroundColor: colors.muted }]}>
              <View style={[styles.miniBarFill, { width: `${m.val}%` as any, backgroundColor: m.color }]} />
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.arrowBtn, { backgroundColor: colors.blush }]}>
        <Feather name="arrow-right" size={14} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { scanHistory, setCurrentScan } = useApp();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const handleScanPress = (scan: ScanResult) => {
    setCurrentScan(scan);
    router.push("/results");
  };

  const bestScore = scanHistory.length > 0 ? Math.max(...scanHistory.map((r) => r.skinScore)) : 0;
  const avgScore = scanHistory.length > 0
    ? (scanHistory.reduce((s, r) => s + r.skinScore, 0) / scanHistory.length).toFixed(1)
    : "0";

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      {/* Dark hero header */}
      <View style={[styles.darkHeader, { paddingTop: topInset + 16 }]}>
        <LinearGradient colors={[colors.dark, colors.darkSurface]} style={StyleSheet.absoluteFill} />
        <View style={styles.headerGlow} />

        <Text style={styles.headerTitle}>Scan History</Text>
        <Text style={styles.headerSub}>
          {scanHistory.length} scan{scanHistory.length !== 1 ? "s" : ""} recorded
        </Text>

        {/* Compact stat strip */}
        {scanHistory.length > 0 && (
          <View style={styles.statStrip}>
            {[
              { icon: "activity" as const, label: "Total", value: String(scanHistory.length) },
              { icon: "bar-chart-2" as const, label: "Average", value: avgScore },
              { icon: "award" as const, label: "Best", value: String(bestScore) },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={styles.stripDivider} />}
                <View style={styles.statItem}>
                  <Feather name={s.icon} size={14} color={colors.primary} style={{ marginBottom: 4 }} />
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}
      </View>

      {scanHistory.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.blush }]}>
            <Feather name="camera" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No scans yet</Text>
          <Text style={[styles.emptySub, { color: colors.taupe }]}>
            Take your first scan to start tracking your skin health journey.
          </Text>
          <TouchableOpacity
            style={[styles.scanBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/camera")}
          >
            <Feather name="camera" size={18} color="#fff" />
            <Text style={styles.scanBtnText}>Take First Scan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={scanHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ScanHistoryCard scan={item} onPress={() => handleScanPress(item)} />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 118 : 100 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkHeader: { paddingHorizontal: 20, paddingBottom: 0, overflow: "hidden" },
  headerGlow: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(232,115,138,0.1)", top: -60, right: -30 },
  headerTitle: { fontSize: 28, fontFamily: "Nunito_800ExtraBold", color: "#fff", marginBottom: 4 },
  headerSub: { fontSize: 13, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.45)", marginBottom: 20 },
  statStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  statLabel: { fontSize: 11, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.4)", marginTop: 2 },
  stripDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  list: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 20, padding: 16 },
  cardLeft: {},
  scoreCircle: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 1 },
  scoreNum: { fontSize: 24, fontFamily: "Nunito_800ExtraBold" },
  scoreOf: { fontSize: 11, fontFamily: "Nunito_600SemiBold", marginTop: 6 },
  cardBody: { flex: 1, gap: 4 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateText: { fontSize: 14, fontFamily: "Nunito_700Bold" },
  timeText: { fontSize: 11, fontFamily: "Nunito_400Regular" },
  ageText: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  miniBarRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  miniBarTrack: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  miniBarFill: { height: "100%", borderRadius: 2 },
  arrowBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 16 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 22, fontFamily: "Nunito_700Bold" },
  emptySub: { fontSize: 15, fontFamily: "Nunito_400Regular", textAlign: "center", lineHeight: 22 },
  scanBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 28, marginTop: 8 },
  scanBtnText: { fontSize: 16, fontFamily: "Nunito_700Bold", color: "#fff" },
});
