import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const TIPS = [
  {
    icon: "droplet" as const,
    title: "Stay Hydrated",
    desc: "Drink 8 glasses of water daily for plump, glowing skin.",
  },
  {
    icon: "sun" as const,
    title: "SPF Every Day",
    desc: "UV rays are the #1 cause of premature skin aging.",
  },
  {
    icon: "moon" as const,
    title: "Sleep & Repair",
    desc: "Skin regenerates while you sleep — aim for 7-9 hours.",
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, scanHistory, canScanToday } = useApp();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const lastScan = scanHistory[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 16, paddingBottom: 100 },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.taupe }]}>
              Good morning,
            </Text>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {user?.name || "Beautiful"} ✦
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: colors.blush }]}
            onPress={() => router.push("/subscribe")}
          >
            <Feather name="bell" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Scan CTA Card */}
        <TouchableOpacity
          onPress={() =>
            canScanToday ? router.push("/camera") : router.push("/subscribe")
          }
          activeOpacity={0.92}
        >
          <LinearGradient
            colors={[colors.primary, colors.roseDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanCard}
          >
            <View style={styles.scanCardContent}>
              <View>
                <Text style={[styles.scanCardLabel, { color: "rgba(255,255,255,0.8)" }]}>
                  {canScanToday ? "Ready for your scan?" : "Daily limit reached"}
                </Text>
                <Text style={[styles.scanCardTitle, { color: "#fff" }]}>
                  {canScanToday
                    ? "Analyze My Skin"
                    : "Upgrade to Pro"}
                </Text>
                <Text style={[styles.scanCardSub, { color: "rgba(255,255,255,0.75)" }]}>
                  {canScanToday
                    ? "AI-powered skin analysis in seconds"
                    : "Unlimited scans with Pro plan"}
                </Text>
              </View>
              <View style={styles.scanIconWrap}>
                <Feather name="camera" size={36} color="#fff" />
              </View>
            </View>
            <View style={styles.scanBadge}>
              <Feather name="zap" size={12} color={colors.primary} />
              <Text style={[styles.scanBadgeText, { color: colors.primary }]}>
                AI Powered
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Last Scan */}
        {lastScan && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Last Scan
            </Text>
            <TouchableOpacity
              style={[styles.lastScanCard, { backgroundColor: colors.card }]}
              onPress={() => router.push("/results")}
            >
              <View
                style={[styles.scoreCircle, { backgroundColor: colors.blush }]}
              >
                <Text
                  style={[styles.scoreNum, { color: colors.primary }]}
                >
                  {lastScan.skinScore}
                </Text>
                <Text style={[styles.scoreOf, { color: colors.taupe }]}>
                  /10
                </Text>
              </View>
              <View style={styles.scanMeta}>
                <Text style={[styles.scanMetaTitle, { color: colors.foreground }]}>
                  Skin Score
                </Text>
                <Text style={[styles.scanMetaSub, { color: colors.taupe }]}>
                  Skin age {lastScan.skinAge} · {new Date(lastScan.date).toLocaleDateString()}
                </Text>
                <View style={styles.metricsRow}>
                  {[
                    { label: "Hydration", val: lastScan.hydration },
                    { label: "Texture", val: lastScan.texture },
                  ].map((m) => (
                    <View
                      key={m.label}
                      style={[styles.metricChip, { backgroundColor: colors.blush }]}
                    >
                      <Text style={[styles.metricChipText, { color: colors.roseDeep }]}>
                        {m.label} {m.val}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={colors.taupeLight} />
            </TouchableOpacity>
          </View>
        )}

        {/* Pro Banner */}
        {!user?.isPro && (
          <TouchableOpacity onPress={() => router.push("/subscribe")}>
            <LinearGradient
              colors={[colors.goldLight, "#FFF8F5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.proBanner, { borderColor: colors.gold }]}
            >
              <Feather name="star" size={18} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.proBannerTitle, { color: colors.foreground }]}>
                  Upgrade to Pro
                </Text>
                <Text style={[styles.proBannerSub, { color: colors.taupe }]}>
                  Unlimited scans, AI routines & deep reports
                </Text>
              </View>
              <View style={[styles.proBadge, { backgroundColor: colors.gold }]}>
                <Text style={[styles.proBadgeText, { color: "#fff" }]}>
                  $9.99/mo
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Daily Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Skin Tips
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tipsRow}
          >
            {TIPS.map((tip) => (
              <View
                key={tip.title}
                style={[styles.tipCard, { backgroundColor: colors.card }]}
              >
                <View style={[styles.tipIcon, { backgroundColor: colors.blush }]}>
                  <Feather name={tip.icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.tipTitle, { color: colors.foreground }]}>
                  {tip.title}
                </Text>
                <Text style={[styles.tipDesc, { color: colors.taupe }]}>
                  {tip.desc}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { fontSize: 14, fontFamily: "Nunito_400Regular" },
  name: { fontSize: 24, fontFamily: "Nunito_800ExtraBold" },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  scanCard: {
    borderRadius: 24,
    padding: 24,
    gap: 16,
    overflow: "hidden",
  },
  scanCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scanCardLabel: { fontSize: 13, fontFamily: "Nunito_500Medium", marginBottom: 4 },
  scanCardTitle: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", marginBottom: 4 },
  scanCardSub: { fontSize: 13, fontFamily: "Nunito_400Regular" },
  scanIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  scanBadgeText: { fontSize: 12, fontFamily: "Nunito_700Bold" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Nunito_700Bold" },
  lastScanCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 2,
  },
  scoreNum: { fontSize: 28, fontFamily: "Nunito_800ExtraBold" },
  scoreOf: { fontSize: 14, fontFamily: "Nunito_600SemiBold", marginTop: 8 },
  scanMeta: { flex: 1, gap: 4 },
  scanMetaTitle: { fontSize: 16, fontFamily: "Nunito_700Bold" },
  scanMetaSub: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  metricsRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  metricChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  metricChipText: { fontSize: 11, fontFamily: "Nunito_600SemiBold" },
  proBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  proBannerTitle: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  proBannerSub: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  proBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  proBadgeText: { fontSize: 12, fontFamily: "Nunito_700Bold" },
  tipsRow: { gap: 12, paddingRight: 4 },
  tipCard: {
    width: 160,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: { fontSize: 14, fontFamily: "Nunito_700Bold" },
  tipDesc: { fontSize: 12, fontFamily: "Nunito_400Regular", lineHeight: 18 },
});
