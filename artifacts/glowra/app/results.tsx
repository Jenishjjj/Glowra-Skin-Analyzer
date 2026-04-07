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
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ── Metric definitions ──────────────────────────────────────────────────────
const METRIC_ORDER = ["hydration", "pigmentation", "texture", "pores", "elasticity"] as const;

const METRIC_LABELS: Record<string, { label: string; icon: string; desc: string; accent: string }> = {
  hydration:    { label: "Hydration",   icon: "droplet",   desc: "Skin moisture retention",         accent: "#60B4FF" },
  pigmentation: { label: "Pigmentation",icon: "circle",    desc: "Evenness of skin tone",            accent: "#A78BFA" },
  texture:      { label: "Texture",     icon: "layers",    desc: "Smoothness of skin surface",       accent: "#4CAF50" },
  pores:        { label: "Pores",       icon: "aperture",  desc: "Pore visibility & cleanliness",    accent: "#E8738A" },
  elasticity:   { label: "Elasticity",  icon: "activity",  desc: "Skin firmness & bounce-back",      accent: "#FF9F43" },
};

// Free users see only the first 2 (hydration, pigmentation)
const FREE_VISIBLE_COUNT = 2;

function getGrade(val: number) {
  if (val >= 80) return { label: "Excellent", color: "#4CAF50" };
  if (val >= 65) return { label: "Good",      color: "#8BC34A" };
  if (val >= 50) return { label: "Fair",      color: "#FFC107" };
  return              { label: "Needs Care",  color: "#E8738A" };
}

// ── Visible metric card ──────────────────────────────────────────────────────
function MetricBar({ metricKey, value, delay }: { metricKey: string; value: number; delay: number }) {
  const colors = useColors();
  const meta = METRIC_LABELS[metricKey];
  const grade = getGrade(value);
  const barWidth = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(16);

  useEffect(() => {
    barWidth.value = withDelay(delay, withTiming(value, { duration: 900 }));
    cardOpacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    cardY.value = withDelay(delay, withSpring(0, { damping: 16 }));
  }, []);

  const barStyle = useAnimatedStyle(() => ({ width: `${barWidth.value}%` as any }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  return (
    <Animated.View style={[styles.metricCard, { backgroundColor: colors.card }, cardStyle]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIconWrap, { backgroundColor: meta.accent + "18" }]}>
          <Feather name={meta.icon as React.ComponentProps<typeof Feather>["name"]} size={16} color={meta.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.metricLabel, { color: colors.foreground }]}>{meta.label}</Text>
          <Text style={[styles.metricDesc, { color: colors.taupe }]}>{meta.desc}</Text>
        </View>
        <View style={styles.metricRight}>
          <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
          <Text style={[styles.metricGrade, { color: grade.color }]}>{grade.label}</Text>
        </View>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
        <Animated.View style={[styles.barFill, barStyle, { backgroundColor: grade.color }]} />
      </View>
    </Animated.View>
  );
}

// ── Locked metric card ────────────────────────────────────────────────────────
function LockedMetricCard({ metricKey, index }: { metricKey: string; index: number }) {
  const colors = useColors();
  const meta = METRIC_LABELS[metricKey];

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  useEffect(() => {
    opacity.value = withDelay(index * 80, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(index * 80, withSpring(0, { damping: 16 }));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));

  return (
    <Animated.View style={[styles.metricCard, { backgroundColor: colors.card }, style]}>
      {/* Header row — identical layout to visible cards */}
      <View style={styles.metricHeader}>
        <View style={[styles.metricIconWrap, { backgroundColor: meta.accent + "18" }]}>
          <Feather name={meta.icon as React.ComponentProps<typeof Feather>["name"]} size={16} color={meta.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.metricLabel, { color: colors.foreground }]}>{meta.label}</Text>
          <Text style={[styles.metricDesc, { color: colors.taupe }]}>{meta.desc}</Text>
        </View>
        {/* Blurred score area */}
        <View style={styles.metricRight}>
          <View style={[styles.blurBlock, { width: 40, height: 24, borderRadius: 6, backgroundColor: colors.muted, marginBottom: 5 }]} />
          <View style={[styles.blurBlock, { width: 56, height: 12, borderRadius: 4, backgroundColor: colors.border }]} />
        </View>
      </View>
      {/* Blurred bar row */}
      <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
        <View style={[styles.barFill, { width: "65%", backgroundColor: colors.border, opacity: 0.6 }]} />
      </View>
      {/* Lock pill at bottom */}
      <View style={styles.lockPillRow}>
        <View style={[styles.lockPill, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "25" }]}>
          <Feather name="lock" size={11} color={colors.primary} />
          <Text style={[styles.lockPillText, { color: colors.primary }]}>Upgrade to Plus or Pro</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Upgrade nudge after locked cards ────────────────────────────────────────
function LockedNudge({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.nudgeWrap}>
      <LinearGradient
        colors={[colors.dark, colors.darkCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.nudgeCard}
      >
        <View style={[styles.nudgeIcon, { backgroundColor: colors.gold + "20" }]}>
          <Feather name="lock" size={18} color={colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nudgeTitle}>3 Analytics Locked</Text>
          <Text style={styles.nudgeSub}>Texture · Pores · Elasticity — unlock with Plus or Pro</Text>
        </View>
        <View style={[styles.nudgeBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.nudgeBtnText}>Unlock</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── Score hero ────────────────────────────────────────────────────────────────
function ScoreHero({ score, skinAge, actualAge }: { score: number; skinAge: number; actualAge: number }) {
  const colors = useColors();
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const glowOp = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 13 });
    opacity.value = withTiming(1, { duration: 600 });
    glowOp.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 1600 }), withTiming(0.3, { duration: 1600 })),
      -1
    );
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOp.value }));

  const scoreColor = score >= 8 ? "#4CAF50" : score >= 6 ? colors.gold : colors.primary;
  const ageDiff = skinAge - actualAge;

  return (
    <View style={styles.heroSection}>
      <LinearGradient colors={[colors.dark, colors.darkSurface, colors.darkCard]} style={StyleSheet.absoluteFill} />
      <View style={styles.heroDecorCircle1} />
      <View style={styles.heroDecorCircle2} />

      <Animated.View style={[styles.scoreContainer, heroStyle]}>
        <Animated.View style={[styles.scoreGlowRing, { borderColor: scoreColor + "50" }, glowStyle]} />
        <View style={[styles.scoreRing, { borderColor: scoreColor + "40", backgroundColor: colors.darkCard }]}>
          <Text style={[styles.scoreNum, { color: scoreColor }]}>{score}</Text>
          <Text style={[styles.scoreOutOf, { color: "rgba(255,255,255,0.4)" }]}>/10</Text>
          <Text style={[styles.scoreLabel, { color: "rgba(255,255,255,0.55)" }]}>Skin Score</Text>
        </View>
      </Animated.View>

      <View style={styles.ageBadgeRow}>
        <View style={[styles.ageBadge, { backgroundColor: "rgba(212,169,106,0.18)", borderColor: "rgba(212,169,106,0.3)" }]}>
          <Feather name="calendar" size={12} color={colors.gold} />
          <Text style={[styles.ageBadgeText, { color: colors.gold }]}>Skin Age {skinAge}</Text>
        </View>
        <View style={[styles.ageBadge, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)" }]}>
          <Feather name="user" size={12} color="rgba(255,255,255,0.6)" />
          <Text style={[styles.ageBadgeText, { color: "rgba(255,255,255,0.6)" }]}>Actual Age {actualAge}</Text>
        </View>
      </View>
      <Text style={[styles.ageCaption, { color: ageDiff <= -2 ? "#4CAF50" : "rgba(255,255,255,0.5)" }]}>
        {ageDiff <= -2
          ? "Your skin looks younger than your age!"
          : ageDiff >= 2
          ? "Your skin shows some age signs"
          : "Your skin age matches your actual age"}
      </Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ResultsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { currentScan, user } = useApp();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (!currentScan) {
    return (
      <View style={[styles.container, { backgroundColor: colors.cream, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ fontFamily: "Nunito_400Regular", color: colors.taupe, marginBottom: 12 }}>
          No scan results found
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
          <Text style={{ fontFamily: "Nunito_600SemiBold", color: colors.primary }}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSubscribed = user?.isPro ?? false;

  const scanValues: Record<string, number> = {
    hydration:    currentScan.hydration,
    pigmentation: currentScan.pigmentation,
    texture:      currentScan.texture,
    pores:        currentScan.pores,
    elasticity:   currentScan.elasticity ?? 72,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
      >
        {/* Dark score hero */}
        <ScoreHero
          score={currentScan.skinScore}
          skinAge={currentScan.skinAge}
          actualAge={currentScan.actualAge}
        />

        {/* Floating nav over hero */}
        <View style={[styles.headerOverlay, { top: topInset + 12 }]}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.replace("/(tabs)")}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Results</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="share-2" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Body content */}
        <View style={styles.content}>

          {/* ── Skin Analytics section ──────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Skin Analytics</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.analyticsBadge, { backgroundColor: colors.blush }]}>
                  <Text style={[styles.analyticsBadgeText, { color: colors.primary }]}>5 markers</Text>
                </View>
                {!isSubscribed && (
                  <View style={[styles.lockedBadge, { backgroundColor: colors.dark }]}>
                    <Feather name="lock" size={10} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.lockedBadgeText}>3 locked</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Free-user info strip */}
            {!isSubscribed && (
              <View style={[styles.freeInfoStrip, { backgroundColor: colors.goldLight, borderColor: colors.gold + "50" }]}>
                <Feather name="info" size={13} color={colors.gold} />
                <Text style={[styles.freeInfoText, { color: colors.gold }]}>
                  Free plan shows 2 of 5 analytics. Upgrade to see all.
                </Text>
              </View>
            )}

            {/* Metrics list */}
            <View style={styles.metricsGrid}>
              {METRIC_ORDER.map((key, index) => {
                const isVisible = isSubscribed || index < FREE_VISIBLE_COUNT;
                if (isVisible) {
                  return (
                    <MetricBar
                      key={key}
                      metricKey={key}
                      value={scanValues[key]}
                      delay={index * 120}
                    />
                  );
                } else {
                  return (
                    <LockedMetricCard
                      key={key}
                      metricKey={key}
                      index={index - FREE_VISIBLE_COUNT}
                    />
                  );
                }
              })}
            </View>

            {/* Upgrade nudge below locked cards */}
            {!isSubscribed && (
              <LockedNudge onPress={() => router.push("/subscribe")} />
            )}
          </View>

          {/* ── AI Recommendations ─────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Recommendations</Text>

            {isSubscribed ? (
              <TouchableOpacity
                style={styles.routineCard}
                onPress={() => router.push("/routine")}
                activeOpacity={0.88}
              >
                <LinearGradient colors={[colors.dark, colors.darkCard]} style={styles.routineCardInner}>
                  <View style={[styles.routineIcon, { backgroundColor: colors.gold + "20" }]}>
                    <Feather name="sun" size={22} color={colors.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.routineTitle}>View My AI Routine</Text>
                    <Text style={styles.routineSub}>Personalized morning & evening routine</Text>
                  </View>
                  <View style={[styles.routineArrow, { backgroundColor: colors.primary }]}>
                    <Feather name="arrow-right" size={16} color="#fff" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.lockedAiCard, { backgroundColor: colors.card }]}
                onPress={() => router.push("/subscribe")}
              >
                <LinearGradient colors={["#F9E8E8", "#FFF8F5"]} style={styles.lockedAiGrad}>
                  <View style={styles.lockedRow}>
                    <View style={[styles.lockIconLg, { backgroundColor: colors.primary + "18" }]}>
                      <Feather name="lock" size={22} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.lockedTitle, { color: colors.foreground }]}>Pro Feature</Text>
                      <Text style={[styles.lockedSub, { color: colors.taupe }]}>
                        AI suggestions, daily routines & deep skin analysis
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
                    onPress={() => router.push("/subscribe")}
                  >
                    <Feather name="star" size={14} color="#fff" />
                    <Text style={[styles.upgradeBtnText, { color: "#fff" }]}>Unlock with Pro</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Action buttons ─────────────────────────────────────── */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.dark }]}
              onPress={() => router.push("/camera")}
            >
              <Feather name="refresh-cw" size={16} color="#fff" />
              <Text style={[styles.actionBtnText, { color: "#fff" }]}>New Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
              onPress={() => router.push("/(tabs)/history")}
            >
              <Feather name="clock" size={16} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hero
  heroSection: { height: 340, alignItems: "center", justifyContent: "flex-end", paddingBottom: 28, overflow: "hidden" },
  heroDecorCircle1: { position: "absolute", width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(232,115,138,0.06)", top: -80, right: -60 },
  heroDecorCircle2: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(232,115,138,0.05)", bottom: -40, left: -40 },
  scoreContainer: { position: "relative", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  scoreGlowRing: { position: "absolute", width: 180, height: 180, borderRadius: 90, borderWidth: 1 },
  scoreRing: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  scoreNum: { fontSize: 58, fontFamily: "Nunito_800ExtraBold", lineHeight: 62 },
  scoreOutOf: { fontSize: 16, fontFamily: "Nunito_600SemiBold" },
  scoreLabel: { fontSize: 12, fontFamily: "Nunito_500Medium" },
  ageBadgeRow: { flexDirection: "row", gap: 10 },
  ageBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  ageBadgeText: { fontSize: 12, fontFamily: "Nunito_600SemiBold" },
  ageCaption: { fontSize: 13, fontFamily: "Nunito_500Medium", marginTop: 8 },

  // Floating header
  headerOverlay: { position: "absolute", left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontFamily: "Nunito_700Bold", color: "#fff" },

  // Content
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 24 },
  section: { gap: 12 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 18, fontFamily: "Nunito_700Bold" },
  badgeRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  analyticsBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  analyticsBadgeText: { fontSize: 12, fontFamily: "Nunito_600SemiBold" },
  lockedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  lockedBadgeText: { fontSize: 11, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.7)" },

  // Free info strip
  freeInfoStrip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  freeInfoText: { fontSize: 12, fontFamily: "Nunito_500Medium", flex: 1 },

  // Metrics grid
  metricsGrid: { gap: 10 },

  // Visible metric card
  metricCard: { borderRadius: 18, padding: 16, gap: 12 },
  metricHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  metricIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  metricLabel: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  metricDesc: { fontSize: 11, fontFamily: "Nunito_400Regular" },
  metricRight: { alignItems: "flex-end" },
  metricValue: { fontSize: 22, fontFamily: "Nunito_800ExtraBold" },
  metricGrade: { fontSize: 11, fontFamily: "Nunito_600SemiBold" },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },

  // Locked metric card (reuses metricCard style)
  blurBlock: {},
  lockPillRow: { alignItems: "flex-start" },
  lockPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  lockPillText: { fontSize: 11, fontFamily: "Nunito_600SemiBold" },

  // Nudge card
  nudgeWrap: { marginTop: 4 },
  nudgeCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18 },
  nudgeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  nudgeTitle: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#fff", marginBottom: 2 },
  nudgeSub: { fontSize: 11, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.5)" },
  nudgeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  nudgeBtnText: { fontSize: 13, fontFamily: "Nunito_700Bold", color: "#fff" },

  // Routine / AI card
  routineCard: { borderRadius: 20, overflow: "hidden" },
  routineCardInner: { flexDirection: "row", alignItems: "center", padding: 18, gap: 14 },
  routineIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  routineTitle: { fontSize: 16, fontFamily: "Nunito_700Bold", color: "#fff" },
  routineSub: { fontSize: 12, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  routineArrow: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  lockedAiCard: { borderRadius: 20, overflow: "hidden" },
  lockedAiGrad: { padding: 20, gap: 14 },
  lockedRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  lockIconLg: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  lockedTitle: { fontSize: 16, fontFamily: "Nunito_700Bold", marginBottom: 4 },
  lockedSub: { fontSize: 13, fontFamily: "Nunito_400Regular", lineHeight: 20 },
  upgradeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 46, borderRadius: 23 },
  upgradeBtnText: { fontSize: 14, fontFamily: "Nunito_700Bold" },

  // Action buttons
  actionsRow: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 26 },
  actionBtnText: { fontSize: 14, fontFamily: "Nunito_600SemiBold" },
});
