import { Icon, IconName } from "@/components/Icon";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { generateRoutineWithAI, RoutineData, RoutineStep } from "@/lib/aiService";

const STEP_ICONS: IconName[] = ["droplets", "sun", "cloud", "shield", "star"];
const AM_ICONS: IconName[] = ["droplets", "sun", "cloud", "shield"];
const PM_ICONS: IconName[] = ["moon", "droplet", "star", "heart", "activity"];

const routineCache = new Map<string, RoutineData>();

function RoutineStepCard({
  item,
  isAM,
  iconName,
}: {
  item: RoutineStep;
  isAM: boolean;
  iconName: IconName;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.stepCard, { backgroundColor: colors.card }]}
      onPress={() => setExpanded((e) => !e)}
      activeOpacity={0.85}
    >
      <View style={styles.stepRow}>
        <View
          style={[
            styles.stepNum,
            { backgroundColor: isAM ? colors.goldLight : colors.blush },
          ]}
        >
          <Text
            style={[
              styles.stepNumText,
              { color: isAM ? colors.gold : colors.primary },
            ]}
          >
            {item.step}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.stepTitle, { color: colors.foreground }]}>
            {item.title}
          </Text>
          <Text style={[styles.stepProduct, { color: colors.taupe }]}>
            {item.product}
          </Text>
        </View>
        <View style={[styles.durationBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.durationText, { color: colors.taupe }]}>
            {item.duration}
          </Text>
        </View>
        <Icon
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.taupeLight}
        />
      </View>
      {expanded && (
        <View style={[styles.tipRow, { backgroundColor: colors.muted }]}>
          <Icon name="info" size={14} color={colors.taupe} />
          <Text style={[styles.tipText, { color: colors.taupe }]}>{item.tip}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function LoadingCard() {
  const colors = useColors();
  return (
    <View style={[styles.loadingCard, { backgroundColor: colors.card }]}>
      <ActivityIndicator size="small" color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.loadingTitle, { color: colors.foreground }]}>
          Gemini AI is crafting your routine...
        </Text>
        <Text style={[styles.loadingDesc, { color: colors.taupe }]}>
          Personalizing based on your skin analysis results
        </Text>
      </View>
    </View>
  );
}

export default function RoutineScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, currentScan } = useApp();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"morning" | "evening" | "insights">("morning");
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!currentScan) {
      setLoading(false);
      return;
    }

    const cacheKey = currentScan.id;
    if (routineCache.has(cacheKey)) {
      setRoutine(routineCache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    generateRoutineWithAI(currentScan)
      .then((data) => {
        routineCache.set(cacheKey, data);
        setRoutine(data);
      })
      .catch((err) => {
        console.error("Failed to generate routine:", err);
        setError("Could not generate AI routine. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [currentScan?.id]);

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
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            My Skin Routine
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* AI badge */}
        <View style={[styles.proBadge, { backgroundColor: colors.goldLight }]}>
          <Icon name="star" size={14} color={colors.gold} />
          <Text style={[styles.proBadgeText, { color: colors.gold }]}>
            AI-Personalized by Gemini — Pro Plan
          </Text>
        </View>

        {/* Overall advice */}
        {routine?.overallAdvice && !loading && (
          <View style={[styles.adviceCard, { backgroundColor: colors.card }]}>
            <View style={styles.adviceHeader}>
              <View style={[styles.adviceIcon, { backgroundColor: colors.blush }]}>
                <Icon name="zap" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.adviceTitle, { color: colors.foreground }]}>
                Your AI Skin Analysis
              </Text>
            </View>
            <Text style={[styles.adviceText, { color: colors.taupe }]}>
              {routine.overallAdvice}
            </Text>
          </View>
        )}

        {/* Tab selector */}
        <View style={[styles.tabRow, { backgroundColor: colors.blush }]}>
          {(
            [
              { key: "morning", label: "Morning" },
              { key: "evening", label: "Evening" },
              { key: "insights", label: "AI Tips" },
            ] as const
          ).map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.tab,
                tab === t.key && { backgroundColor: colors.card },
              ]}
              onPress={() => setTab(t.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: tab === t.key ? colors.primary : colors.taupe,
                    fontFamily:
                      tab === t.key ? "Nunito_700Bold" : "Nunito_400Regular",
                  },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <LoadingCard />}

        {error && !loading && (
          <View style={[styles.errorCard, { backgroundColor: colors.card }]}>
            <Icon name="alert-circle" size={20} color={colors.primary} />
            <Text style={[styles.errorText, { color: colors.taupe }]}>{error}</Text>
          </View>
        )}

        {!loading && !error && routine && (
          <>
            {tab === "morning" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Icon name="sun" size={18} color={colors.gold} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    Morning Routine
                  </Text>
                  <Text style={[styles.sectionDuration, { color: colors.taupe }]}>
                    ~5 min
                  </Text>
                </View>
                {routine.morningSteps.map((item, index) => (
                  <RoutineStepCard
                    key={item.step}
                    item={item}
                    isAM={true}
                    iconName={AM_ICONS[index % AM_ICONS.length]}
                  />
                ))}
              </View>
            )}

            {tab === "evening" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Icon name="moon" size={18} color={colors.roseMid} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    Evening Routine
                  </Text>
                  <Text style={[styles.sectionDuration, { color: colors.taupe }]}>
                    ~8 min
                  </Text>
                </View>
                {routine.eveningSteps.map((item, index) => (
                  <RoutineStepCard
                    key={item.step}
                    item={item}
                    isAM={false}
                    iconName={PM_ICONS[index % PM_ICONS.length]}
                  />
                ))}
              </View>
            )}

            {tab === "insights" && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Personalized AI Insights
                </Text>
                {routine.skinInsights.map((s, i) => (
                  <View
                    key={i}
                    style={[styles.suggestionCard, { backgroundColor: colors.card }]}
                  >
                    <View style={styles.suggestionHeader}>
                      <View
                        style={[
                          styles.suggIconWrap,
                          { backgroundColor: colors.blush },
                        ]}
                      >
                        <Icon
                          name={STEP_ICONS[i % STEP_ICONS.length]}
                          size={18}
                          color={colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.insightTopRow}>
                          <Text style={[styles.suggCategory, { color: colors.taupeLight }]}>
                            {s.category}
                          </Text>
                          {s.priority === "high" && (
                            <View style={[styles.priorityBadge, { backgroundColor: colors.primary + "15" }]}>
                              <Text style={[styles.priorityText, { color: colors.primary }]}>Priority</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.suggTitle, { color: colors.foreground }]}>
                          {s.title}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.suggDesc, { color: colors.taupe }]}>
                      {s.desc}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Pro upsell card */}
        {user?.plan === "plus" && (
          <TouchableOpacity
            onPress={() => router.push("/subscribe")}
            activeOpacity={0.88}
            style={styles.proUpsellCard}
          >
            <LinearGradient
              colors={["#1A0A0F", "#2D0E1C"]}
              style={styles.proUpsellGrad}
            >
              <View style={styles.proUpsellGlow} />
              <View style={styles.proUpsellTopRow}>
                <View style={styles.proUpsellBadge}>
                  <Icon name="star" size={11} color={colors.gold} />
                  <Text style={[styles.proUpsellBadgeText, { color: colors.gold }]}>
                    Glowra Pro
                  </Text>
                </View>
                <Text style={styles.proUpsellPrice}>$12.99/mo</Text>
              </View>
              <Text style={styles.proUpsellHeading}>
                Unlock Advanced AI Insights
              </Text>
              <Text style={styles.proUpsellSub}>
                Your Plus plan gives you great tips — but Pro goes deeper with AI trained on your personal scan history.
              </Text>
              <View style={[styles.proUpsellBtn, { backgroundColor: colors.primary }]}>
                <Icon name="zap" size={15} color="#fff" />
                <Text style={styles.proUpsellBtnText}>Upgrade to Pro</Text>
                <Icon name="arrow-right" size={15} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
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
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  proBadgeText: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
  adviceCard: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  adviceHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  adviceIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  adviceTitle: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  adviceText: { fontSize: 13, fontFamily: "Nunito_400Regular", lineHeight: 20 },
  tabRow: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12 },
  tabText: { fontSize: 14 },
  section: { gap: 12 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Nunito_700Bold", flex: 1 },
  sectionDuration: { fontSize: 13, fontFamily: "Nunito_400Regular" },
  stepCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNum: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontSize: 16, fontFamily: "Nunito_800ExtraBold" },
  stepTitle: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  stepProduct: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  durationBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  durationText: { fontSize: 12, fontFamily: "Nunito_500Medium" },
  tipRow: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    alignItems: "flex-start",
  },
  tipText: { fontSize: 12, fontFamily: "Nunito_400Regular", lineHeight: 18, flex: 1 },
  suggestionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  suggestionHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  suggIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  insightTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  suggCategory: { fontSize: 11, fontFamily: "Nunito_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  priorityBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontSize: 10, fontFamily: "Nunito_700Bold" },
  suggTitle: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  suggDesc: { fontSize: 13, fontFamily: "Nunito_400Regular", lineHeight: 20 },
  loadingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 20,
    borderRadius: 18,
  },
  loadingTitle: { fontSize: 15, fontFamily: "Nunito_700Bold", marginBottom: 4 },
  loadingDesc: { fontSize: 13, fontFamily: "Nunito_400Regular" },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 18,
  },
  errorText: { fontSize: 13, fontFamily: "Nunito_400Regular", flex: 1 },
  proUpsellCard: { borderRadius: 24, overflow: "hidden" },
  proUpsellGrad: { padding: 22, gap: 14, overflow: "hidden" },
  proUpsellGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(232,115,138,0.18)",
    top: -60,
    right: -40,
  },
  proUpsellTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  proUpsellBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(212,175,55,0.15)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  proUpsellBadgeText: { fontSize: 12, fontFamily: "Nunito_700Bold" },
  proUpsellPrice: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  proUpsellHeading: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#fff", lineHeight: 26 },
  proUpsellSub: { fontSize: 13, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.55)", lineHeight: 20 },
  proUpsellBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 25,
    marginTop: 4,
  },
  proUpsellBtnText: { fontSize: 15, fontFamily: "Nunito_700Bold", color: "#fff" },
});
