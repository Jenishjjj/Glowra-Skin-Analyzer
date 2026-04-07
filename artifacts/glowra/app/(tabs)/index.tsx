import { Icon, IconName } from "@/components/Icon";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
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

const { width } = Dimensions.get("window");

const TIPS = [
  { icon: "droplet" as const, title: "Stay Hydrated", desc: "Drink 8 glasses of water daily for plump, glowing skin.", accent: "#60B4FF" },
  { icon: "sun" as const, title: "SPF Every Day", desc: "UV rays are the #1 cause of premature skin aging.", accent: "#FFB347" },
  { icon: "moon" as const, title: "Sleep & Repair", desc: "Skin regenerates while you sleep — aim for 7-9 hours.", accent: "#A78BFA" },
  { icon: "wind" as const, title: "Gentle Cleanse", desc: "Over-washing strips your skin barrier. Once at night is enough.", accent: "#4CAF50" },
];

function AnimatedCard({ delay, children, style }: { delay: number; children: React.ReactNode; style?: object }) {
  const translateY = useSharedValue(24);
  const opacity = useSharedValue(0);
  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, { damping: 16 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
  return <Animated.View style={[anim, style]}>{children}</Animated.View>;
}

function TipCard({ tip }: { tip: typeof TIPS[0] }) {
  const colors = useColors();
  return (
    <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={[tip.accent + "20", tip.accent + "08"]}
        style={styles.tipIconWrap}
      >
        <Icon name={tip.icon} size={22} color={tip.accent} />
      </LinearGradient>
      <Text style={[styles.tipTitle, { color: colors.foreground }]}>{tip.title}</Text>
      <Text style={[styles.tipDesc, { color: colors.taupe }]}>{tip.desc}</Text>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, scanHistory, canScanToday } = useApp();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const lastScan = scanHistory[0];

  // Pulsing glow behind scan button
  const glowOpacity = useSharedValue(0.4);
  const glowScale = useSharedValue(1);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 1400 }), withTiming(0.4, { duration: 1400 })),
      -1
    );
    glowScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 1400 }), withTiming(1, { duration: 1400 })),
      -1
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value, transform: [{ scale: glowScale.value }] }));

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      {/* Dark hero header */}
      <LinearGradient
        colors={[colors.dark, colors.darkSurface]}
        style={[styles.darkHeader, { paddingTop: topInset + 8 }]}
      >
        {/* Decorative glow */}
        <View style={styles.headerGlowOrb} />

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || "Beautiful"}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/subscribe")}
          >
            {user?.isPro ? (
              <LinearGradient colors={[colors.gold, "#E8AB4A"]} style={styles.notifGrad}>
                <Icon name="star" size={16} color="#fff" />
              </LinearGradient>
            ) : (
              <>
                <Icon name="bell" size={18} color="rgba(255,255,255,0.8)" />
                <View style={styles.notifDot} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Scan CTA */}
        <AnimatedCard delay={100} style={styles.scanCardWrap}>
          <TouchableOpacity
            onPress={() => canScanToday ? router.push("/camera") : router.push("/subscribe")}
            activeOpacity={0.9}
          >
            {/* Glow behind button */}
            <Animated.View style={[styles.scanGlow, glowStyle]} />
            <LinearGradient
              colors={[colors.primary, "#C4566A", "#8B2040"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scanCard}
            >
              {/* Decorative circle */}
              <View style={styles.scanDecorCircle} />

              <View style={styles.scanCardContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scanCardEyebrow}>
                    {canScanToday ? "AI Skin Analysis" : "Daily limit reached"}
                  </Text>
                  <Text style={styles.scanCardTitle}>
                    {canScanToday ? "Scan My Skin" : "Go Pro"}
                  </Text>
                  <Text style={styles.scanCardSub}>
                    {canScanToday ? "Results in under 10 seconds" : "Unlimited scans with Pro"}
                  </Text>
                </View>
                <View style={styles.scanIconCircle}>
                  <Icon name={canScanToday ? "camera" : "zap"} size={32} color="#fff" />
                </View>
              </View>

              <View style={styles.scanFooter}>
                <View style={styles.scanBadge}>
                  <Icon name="zap" size={11} color={colors.primary} />
                  <Text style={[styles.scanBadgeText, { color: colors.primary }]}>AI Powered</Text>
                </View>
                <Text style={styles.scanFreeLabel}>
                  {canScanToday ? (user?.isPro ? "Unlimited" : "1 free scan today") : "Upgrade for more"}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </AnimatedCard>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 110 }]}
      >
        {/* Last Scan Card */}
        {lastScan ? (
          <AnimatedCard delay={200}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Last Scan</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
                <Text style={[styles.sectionLink, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.lastScanCard, { backgroundColor: colors.card }]}
              onPress={() => router.push("/results")}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primary + "25", colors.roseDeep + "10"]}
                style={styles.scoreCircle}
              >
                <Text style={[styles.scoreNum, { color: colors.primary }]}>{lastScan.skinScore}</Text>
                <Text style={[styles.scoreOf, { color: colors.taupe }]}>/10</Text>
              </LinearGradient>
              <View style={styles.scanMeta}>
                <Text style={[styles.scanMetaTitle, { color: colors.foreground }]}>Skin Score</Text>
                <Text style={[styles.scanMetaSub, { color: colors.taupe }]}>
                  Skin age {lastScan.skinAge} · {new Date(lastScan.date).toLocaleDateString()}
                </Text>
                <View style={styles.metricsRow}>
                  {[
                    { label: "Hydration", val: lastScan.hydration, color: "#60B4FF" },
                    { label: "Texture", val: lastScan.texture, color: "#4CAF50" },
                  ].map((m) => (
                    <View key={m.label} style={[styles.metricChip, { backgroundColor: m.color + "18" }]}>
                      <Text style={[styles.metricChipText, { color: m.color }]}>{m.label} {m.val}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={[styles.arrowCircle, { backgroundColor: colors.blush }]}>
                <Icon name="arrow-right" size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        ) : (
          <AnimatedCard delay={200}>
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.blush }]}>
                <Icon name="camera" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No scans yet</Text>
              <Text style={[styles.emptySub, { color: colors.taupe }]}>Take your first skin scan to see your results here.</Text>
            </View>
          </AnimatedCard>
        )}

        {/* Pro Banner */}
        {!user?.isPro && (
          <AnimatedCard delay={300}>
            <TouchableOpacity onPress={() => router.push("/subscribe")} activeOpacity={0.88}>
              <LinearGradient
                colors={[colors.dark, colors.darkCard]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.proBanner}
              >
                <View style={[styles.proIconWrap, { backgroundColor: colors.gold + "25", borderColor: colors.gold + "40" }]}>
                  <Icon name="star" size={20} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.proBannerTitle}>Upgrade to Pro</Text>
                  <Text style={styles.proBannerSub}>Unlimited scans, AI routines & deep insights</Text>
                </View>
                <View style={[styles.proPriceBadge, { backgroundColor: colors.gold }]}>
                  <Text style={styles.proPriceText}>$12.99</Text>
                  <Text style={styles.proPriceSub}>/mo</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </AnimatedCard>
        )}

        {/* Skin Tips */}
        <AnimatedCard delay={400}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>
            Skin Tips
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tipsScroll}
          >
            {TIPS.map((tip) => <TipCard key={tip.title} tip={tip} />)}
          </ScrollView>
        </AnimatedCard>

        {/* Quick actions */}
        <AnimatedCard delay={500}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>
            Quick Actions
          </Text>
          <View style={styles.quickRow}>
            {[
              { icon: "clock" as const, label: "History", route: "/(tabs)/history" as const },
              { icon: "sun" as const, label: "Routine", route: "/routine" as const },
              { icon: "user" as const, label: "Profile", route: "/(tabs)/profile" as const },
            ].map((q) => (
              <TouchableOpacity
                key={q.label}
                style={[styles.quickBtn, { backgroundColor: colors.card }]}
                onPress={() => router.push(q.route)}
              >
                <View style={[styles.quickIcon, { backgroundColor: colors.blush }]}>
                  <Icon name={q.icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.quickLabel, { color: colors.foreground }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkHeader: { paddingHorizontal: 20, paddingBottom: 24, position: "relative", overflow: "hidden" },
  headerGlowOrb: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(232,115,138,0.1)",
    top: -80,
    right: -60,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.5)" },
  userName: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  notifGrad: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  notifDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: "#E8738A" },
  scanCardWrap: { position: "relative" },
  scanGlow: {
    position: "absolute",
    top: -8,
    bottom: -8,
    left: -8,
    right: -8,
    borderRadius: 32,
    backgroundColor: "rgba(232,115,138,0.35)",
    zIndex: 0,
  },
  scanCard: { borderRadius: 24, padding: 22, gap: 16, overflow: "hidden", zIndex: 1 },
  scanDecorCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
    right: -40,
    top: -60,
  },
  scanCardContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  scanCardEyebrow: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.65)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 },
  scanCardTitle: { fontSize: 26, fontFamily: "Nunito_800ExtraBold", color: "#fff", marginBottom: 4 },
  scanCardSub: { fontSize: 13, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.7)" },
  scanIconCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  scanFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scanBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  scanBadgeText: { fontSize: 11, fontFamily: "Nunito_700Bold" },
  scanFreeLabel: { fontSize: 12, fontFamily: "Nunito_500Medium", color: "rgba(255,255,255,0.55)" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Nunito_700Bold" },
  sectionLink: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
  lastScanCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 20, padding: 16,
  },
  scoreCircle: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 1 },
  scoreNum: { fontSize: 26, fontFamily: "Nunito_800ExtraBold" },
  scoreOf: { fontSize: 13, fontFamily: "Nunito_600SemiBold", marginTop: 6 },
  scanMeta: { flex: 1, gap: 4 },
  scanMetaTitle: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  scanMetaSub: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  metricsRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  metricChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  metricChipText: { fontSize: 11, fontFamily: "Nunito_600SemiBold" },
  arrowCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  emptyState: { borderRadius: 20, padding: 24, alignItems: "center", gap: 10 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 17, fontFamily: "Nunito_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Nunito_400Regular", textAlign: "center", lineHeight: 20 },
  proBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 20 },
  proIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  proBannerTitle: { fontSize: 15, fontFamily: "Nunito_700Bold", color: "#fff" },
  proBannerSub: { fontSize: 12, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.55)", marginTop: 2 },
  proPriceBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, alignItems: "center" },
  proPriceText: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  proPriceSub: { fontSize: 9, fontFamily: "Nunito_500Medium", color: "rgba(255,255,255,0.7)" },
  tipsScroll: { gap: 12, paddingRight: 4 },
  tipCard: { width: 162, borderRadius: 20, padding: 16, gap: 10 },
  tipIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tipTitle: { fontSize: 14, fontFamily: "Nunito_700Bold" },
  tipDesc: { fontSize: 12, fontFamily: "Nunito_400Regular", lineHeight: 18 },
  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: { flex: 1, borderRadius: 18, padding: 16, alignItems: "center", gap: 8 },
  quickIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
});
