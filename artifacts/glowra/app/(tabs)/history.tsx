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

function ScanHistoryCard({
  scan,
  onPress,
}: {
  scan: ScanResult;
  onPress: () => void;
}) {
  const colors = useColors();
  const scoreColor =
    scan.skinScore >= 8 ? "#4CAF50" : scan.skinScore >= 6 ? colors.gold : colors.primary;
  const date = new Date(scan.date);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.scoreCircle, { backgroundColor: colors.blush }]}>
          <Text style={[styles.scoreNum, { color: scoreColor }]}>
            {scan.skinScore}
          </Text>
          <Text style={[styles.scoreOf, { color: colors.taupe }]}>/10</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.dateRow}>
          <Text style={[styles.dateText, { color: colors.foreground }]}>
            {formatted}
          </Text>
          <Text style={[styles.timeText, { color: colors.taupeLight }]}>
            {time}
          </Text>
        </View>
        <Text style={[styles.ageText, { color: colors.taupe }]}>
          Skin Age: {scan.skinAge} · Actual: {scan.actualAge}
        </Text>
        <View style={styles.metricsRow}>
          {[
            { label: "H", val: scan.hydration, color: "#60B4FF" },
            { label: "P", val: scan.pigmentation, color: "#A78BFA" },
            { label: "T", val: scan.texture, color: "#4CAF50" },
            { label: "Po", val: scan.pores, color: colors.primary },
          ].map((m) => (
            <View
              key={m.label}
              style={[styles.metricBubble, { backgroundColor: m.color + "20" }]}
            >
              <Text style={[styles.metricLabel, { color: m.color }]}>
                {m.label}
              </Text>
              <Text style={[styles.metricVal, { color: m.color }]}>
                {m.val}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={colors.taupeLight} />
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

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topInset + 16, backgroundColor: colors.cream },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Scan History
        </Text>
        <Text style={[styles.headerSub, { color: colors.taupe }]}>
          {scanHistory.length} scan{scanHistory.length !== 1 ? "s" : ""} recorded
        </Text>
      </View>

      {scanHistory.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.blush }]}>
            <Feather name="camera" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No scans yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.taupe }]}>
            Take your first scan to start tracking your skin health journey.
          </Text>
          <TouchableOpacity
            style={[styles.scanBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/camera")}
          >
            <Feather name="camera" size={18} color="#fff" />
            <Text style={[styles.scanBtnText, { color: "#fff" }]}>
              Take First Scan
            </Text>
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
          ListHeaderComponent={
            scanHistory.length > 1 ? (
              <LinearGradient
                colors={[colors.primary + "15", colors.blush]}
                style={styles.statsCard}
              >
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: colors.primary }]}>
                    {scanHistory.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.taupe }]}>
                    Total Scans
                  </Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: colors.primary }]}>
                    {(
                      scanHistory.reduce((s, r) => s + r.skinScore, 0) /
                      scanHistory.length
                    ).toFixed(1)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.taupe }]}>
                    Avg Score
                  </Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: colors.primary }]}>
                    {Math.max(...scanHistory.map((r) => r.skinScore))}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.taupe }]}>
                    Best Score
                  </Text>
                </View>
              </LinearGradient>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, gap: 2 },
  headerTitle: { fontSize: 28, fontFamily: "Nunito_800ExtraBold" },
  headerSub: { fontSize: 14, fontFamily: "Nunito_400Regular" },
  list: { paddingHorizontal: 20, gap: 10, paddingTop: 12 },
  statsCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", gap: 2 },
  statNum: { fontSize: 28, fontFamily: "Nunito_800ExtraBold" },
  statLabel: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  statDivider: { width: 1, height: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLeft: {},
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 2,
  },
  scoreNum: { fontSize: 24, fontFamily: "Nunito_800ExtraBold" },
  scoreOf: { fontSize: 12, fontFamily: "Nunito_600SemiBold", marginTop: 6 },
  cardBody: { flex: 1, gap: 4 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateText: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  timeText: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  ageText: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  metricsRow: { flexDirection: "row", gap: 6, marginTop: 2 },
  metricBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metricLabel: { fontSize: 10, fontFamily: "Nunito_700Bold" },
  metricVal: { fontSize: 10, fontFamily: "Nunito_600SemiBold" },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 22, fontFamily: "Nunito_700Bold" },
  emptySub: { fontSize: 15, fontFamily: "Nunito_400Regular", textAlign: "center", lineHeight: 22 },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 8,
  },
  scanBtnText: { fontSize: 16, fontFamily: "Nunito_700Bold" },
});
