import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const METRIC_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  hydration: {
    label: "Hydration",
    icon: "droplet",
    desc: "Skin moisture retention level",
  },
  pigmentation: {
    label: "Pigmentation",
    icon: "circle",
    desc: "Evenness of skin tone",
  },
  texture: {
    label: "Texture",
    icon: "layers",
    desc: "Smoothness of skin surface",
  },
  pores: {
    label: "Pores",
    icon: "aperture",
    desc: "Pore visibility & cleanliness",
  },
};

function getGrade(val: number) {
  if (val >= 80) return { label: "Excellent", color: "#4CAF50" };
  if (val >= 65) return { label: "Good", color: "#8BC34A" };
  if (val >= 50) return { label: "Fair", color: "#FFC107" };
  return { label: "Needs Care", color: "#E8738A" };
}

function MetricBar({
  metricKey,
  value,
  delay,
}: {
  metricKey: string;
  value: number;
  delay: number;
}) {
  const colors = useColors();
  const meta = METRIC_LABELS[metricKey];
  const grade = getGrade(value);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withDelay(delay, withTiming(value, { duration: 800 }));
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIconWrap, { backgroundColor: colors.blush }]}>
          <Feather
            name={meta.icon as React.ComponentProps<typeof Feather>["name"]}
            size={16}
            color={colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.metricLabel, { color: colors.foreground }]}>
            {meta.label}
          </Text>
          <Text style={[styles.metricDesc, { color: colors.taupe }]}>
            {meta.desc}
          </Text>
        </View>
        <View>
          <Text style={[styles.metricValue, { color: colors.foreground }]}>
            {value}
          </Text>
          <Text style={[styles.metricGrade, { color: grade.color }]}>
            {grade.label}
          </Text>
        </View>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
        <Animated.View
          style={[
            styles.barFill,
            barStyle,
            { backgroundColor: grade.color },
          ]}
        />
      </View>
    </View>
  );
}

function ScoreRing({ score }: { score: number }) {
  const colors = useColors();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    scale.value = withSpring(1, { damping: 12 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const scoreColor =
    score >= 8 ? "#4CAF50" : score >= 6 ? colors.gold : colors.primary;

  return (
    <Animated.View style={[styles.scoreRingOuter, style]}>
      <LinearGradient
        colors={[scoreColor + "30", scoreColor + "10"]}
        style={styles.scoreRingGrad}
      >
        <View style={[styles.scoreRingInner, { backgroundColor: colors.card }]}>
          <Text style={[styles.scoreNum, { color: scoreColor }]}>{score}</Text>
          <Text style={[styles.scoreOutOf, { color: colors.taupe }]}>/10</Text>
          <Text style={[styles.scoreLabel, { color: colors.taupe }]}>
            Skin Score
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export default function ResultsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { currentScan, user } = useApp();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (!currentScan) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.cream, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={[styles.emptyText, { color: colors.taupe }]}>
          No scan results found
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
          <Text style={[styles.emptyLink, { color: colors.primary }]}>
            Go Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const metrics = [
    { key: "hydration", value: currentScan.hydration },
    { key: "pigmentation", value: currentScan.pigmentation },
    { key: "texture", value: currentScan.texture },
    { key: "pores", value: currentScan.pores },
  ];

  const ageDiff = currentScan.skinAge - currentScan.actualAge;
  const ageLabel =
    ageDiff <= -2
      ? "Your skin looks younger than your age!"
      : ageDiff >= 2
      ? "Your skin shows some age signs"
      : "Your skin age matches your actual age";

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 8, paddingBottom: bottomInset + 24 },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.blush }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Feather name="arrow-left" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Your Results
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Score hero */}
        <LinearGradient
          colors={["#F9E8E8", "#FFF8F5"]}
          style={styles.heroCard}
        >
          <ScoreRing score={currentScan.skinScore} />
          <View style={styles.ageRow}>
            <View
              style={[styles.ageBadge, { backgroundColor: colors.goldLight }]}
            >
              <Feather name="calendar" size={14} color={colors.gold} />
              <Text style={[styles.ageText, { color: colors.gold }]}>
                Skin Age: {currentScan.skinAge}
              </Text>
            </View>
            <View
              style={[styles.ageBadge, { backgroundColor: colors.blush }]}
            >
              <Feather name="user" size={14} color={colors.taupe} />
              <Text style={[styles.ageText, { color: colors.taupe }]}>
                Actual Age: {currentScan.actualAge}
              </Text>
            </View>
          </View>
          <Text
            style={[styles.ageCaption, { color: ageDiff <= -2 ? "#4CAF50" : colors.taupe }]}
          >
            {ageLabel}
          </Text>
        </LinearGradient>

        {/* Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Skin Analytics
          </Text>
          <View style={styles.metricsGrid}>
            {metrics.map((m, i) => (
              <MetricBar
                key={m.key}
                metricKey={m.key}
                value={m.value}
                delay={i * 150}
              />
            ))}
          </View>
        </View>

        {/* AI Suggestions — locked for free users */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            AI Recommendations
          </Text>
          {user?.isPro ? (
            <TouchableOpacity
              style={[styles.routineBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/routine")}
            >
              <Feather name="sun" size={20} color="#fff" />
              <Text style={[styles.routineBtnText, { color: "#fff" }]}>
                View My AI Routine
              </Text>
              <Feather name="chevron-right" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.lockedCard, { backgroundColor: colors.card }]}
              onPress={() => router.push("/subscribe")}
            >
              <View style={styles.lockedRow}>
                <View style={[styles.lockIcon, { backgroundColor: colors.blush }]}>
                  <Feather name="lock" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lockedTitle, { color: colors.foreground }]}>
                    Pro Feature
                  </Text>
                  <Text style={[styles.lockedSub, { color: colors.taupe }]}>
                    Upgrade to get AI suggestions, daily routines and deeper skin analysis
                  </Text>
                </View>
              </View>
              <View style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}>
                <Feather name="star" size={14} color="#fff" />
                <Text style={[styles.upgradeBtnText, { color: "#fff" }]}>
                  Unlock with Pro
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/camera")}
          >
            <Feather name="refresh-cw" size={18} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>
              New Scan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(tabs)/history")}
          >
            <Feather name="clock" size={18} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>
              History
            </Text>
          </TouchableOpacity>
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontFamily: "Nunito_700Bold" },
  heroCard: {
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    gap: 20,
  },
  scoreRingOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  scoreRingGrad: {
    flex: 1,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  scoreRingInner: {
    flex: 1,
    width: "100%",
    borderRadius: 74,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNum: { fontSize: 52, fontFamily: "Nunito_800ExtraBold", lineHeight: 56 },
  scoreOutOf: { fontSize: 16, fontFamily: "Nunito_600SemiBold" },
  scoreLabel: { fontSize: 13, fontFamily: "Nunito_500Medium" },
  ageRow: { flexDirection: "row", gap: 10 },
  ageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ageText: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
  ageCaption: { fontSize: 14, fontFamily: "Nunito_500Medium", textAlign: "center" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Nunito_700Bold" },
  metricsGrid: { gap: 10 },
  metricCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  metricHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  metricDesc: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  metricValue: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", textAlign: "right" },
  metricGrade: { fontSize: 11, fontFamily: "Nunito_600SemiBold", textAlign: "right" },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  routineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 28,
  },
  routineBtnText: { fontSize: 16, fontFamily: "Nunito_700Bold", flex: 1 },
  lockedCard: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lockedRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  lockIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedTitle: { fontSize: 16, fontFamily: "Nunito_700Bold", marginBottom: 4 },
  lockedSub: { fontSize: 13, fontFamily: "Nunito_400Regular", lineHeight: 20 },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderRadius: 22,
  },
  upgradeBtnText: { fontSize: 14, fontFamily: "Nunito_700Bold" },
  actionsRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 14, fontFamily: "Nunito_600SemiBold" },
  emptyText: { fontSize: 16, fontFamily: "Nunito_400Regular", marginBottom: 12 },
  emptyLink: { fontSize: 16, fontFamily: "Nunito_600SemiBold" },
});
