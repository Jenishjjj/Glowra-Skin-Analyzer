import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

const AM_ROUTINE = [
  {
    step: 1,
    title: "Gentle Cleanser",
    product: "Use a mild foaming cleanser",
    duration: "60 sec",
    icon: "droplets" as const,
    tip: "Wash with lukewarm water — hot water strips natural oils.",
  },
  {
    step: 2,
    title: "Vitamin C Serum",
    product: "Apply 3-4 drops on damp skin",
    duration: "30 sec",
    icon: "sun" as const,
    tip: "Vitamin C brightens and protects against UV damage.",
  },
  {
    step: 3,
    title: "Hydrating Moisturizer",
    product: "Look for hyaluronic acid",
    duration: "30 sec",
    icon: "cloud" as const,
    tip: "Apply while skin is still slightly damp for best absorption.",
  },
  {
    step: 4,
    title: "SPF 50+ Sunscreen",
    product: "Broad spectrum, lightweight",
    duration: "45 sec",
    icon: "shield" as const,
    tip: "The most important step — reapply every 2 hours outdoors.",
  },
];

const PM_ROUTINE = [
  {
    step: 1,
    title: "Double Cleanse",
    product: "Oil cleanser + gentle foaming",
    duration: "90 sec",
    icon: "moon" as const,
    tip: "Oil cleanser removes sunscreen and makeup thoroughly.",
  },
  {
    step: 2,
    title: "Toner",
    product: "Hydrating, alcohol-free",
    duration: "20 sec",
    icon: "droplet" as const,
    tip: "Balance skin pH and prep for actives.",
  },
  {
    step: 3,
    title: "Retinol Serum",
    product: "Start with 0.025% - 0.05%",
    duration: "30 sec",
    icon: "star" as const,
    tip: "Use only at night. Build up slowly to avoid irritation.",
  },
  {
    step: 4,
    title: "Rich Night Cream",
    product: "Peptides + ceramides",
    duration: "45 sec",
    icon: "heart" as const,
    tip: "Night is when skin repairs. Give it what it needs.",
  },
];

const AI_SUGGESTIONS = [
  {
    icon: "droplet" as const,
    category: "Hydration",
    title: "Increase water intake",
    desc: "Your hydration score suggests dehydrated skin. Drink 2L+ daily and consider a hyaluronic acid serum.",
  },
  {
    icon: "sun" as const,
    category: "Pigmentation",
    title: "Add Niacinamide",
    desc: "Niacinamide 10% helps fade dark spots and even skin tone. Apply after toner, before moisturizer.",
  },
  {
    icon: "layers" as const,
    category: "Texture",
    title: "Weekly exfoliation",
    desc: "Use a gentle AHA (glycolic acid) 1-2x per week to smooth texture. Avoid physical scrubs.",
  },
  {
    icon: "aperture" as const,
    category: "Pores",
    title: "Salicylic acid cleanser",
    desc: "BHA/salicylic acid penetrates pores to clear buildup. Use 2-3x weekly as part of your routine.",
  },
];

function RoutineStep({
  item,
  isAM,
}: {
  item: (typeof AM_ROUTINE)[0] | (typeof PM_ROUTINE)[0];
  isAM: boolean;
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
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.taupeLight}
        />
      </View>
      {expanded && (
        <View style={[styles.tipRow, { backgroundColor: colors.muted }]}>
          <Feather name="info" size={14} color={colors.taupe} />
          <Text style={[styles.tipText, { color: colors.taupe }]}>{item.tip}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function RoutineScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"morning" | "evening" | "suggestions">("morning");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

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
            <Feather name="arrow-left" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            My Skin Routine
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Pro badge */}
        <View style={[styles.proBadge, { backgroundColor: colors.goldLight }]}>
          <Feather name="star" size={14} color={colors.gold} />
          <Text style={[styles.proBadgeText, { color: colors.gold }]}>
            AI-Personalized Routine — Pro Plan
          </Text>
        </View>

        {/* Tab selector */}
        <View style={[styles.tabRow, { backgroundColor: colors.blush }]}>
          {(
            [
              { key: "morning", label: "Morning" },
              { key: "evening", label: "Evening" },
              { key: "suggestions", label: "AI Tips" },
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

        {tab === "morning" && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Feather name="sun" size={18} color={colors.gold} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Morning Routine
              </Text>
              <Text style={[styles.sectionDuration, { color: colors.taupe }]}>
                ~5 min
              </Text>
            </View>
            {AM_ROUTINE.map((item) => (
              <RoutineStep key={item.step} item={item} isAM={true} />
            ))}
          </View>
        )}

        {tab === "evening" && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Feather name="moon" size={18} color={colors.roseMid} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Evening Routine
              </Text>
              <Text style={[styles.sectionDuration, { color: colors.taupe }]}>
                ~8 min
              </Text>
            </View>
            {PM_ROUTINE.map((item) => (
              <RoutineStep key={item.step} item={item} isAM={false} />
            ))}
          </View>
        )}

        {tab === "suggestions" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Personalized AI Suggestions
            </Text>
            {AI_SUGGESTIONS.map((s) => (
              <View
                key={s.title}
                style={[styles.suggestionCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.suggestionHeader}>
                  <View
                    style={[
                      styles.suggIconWrap,
                      { backgroundColor: colors.blush },
                    ]}
                  >
                    <Feather name={s.icon} size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text
                      style={[styles.suggCategory, { color: colors.taupeLight }]}
                    >
                      {s.category}
                    </Text>
                    <Text
                      style={[
                        styles.suggTitle,
                        { color: colors.foreground },
                      ]}
                    >
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
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  suggIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  suggCategory: { fontSize: 11, fontFamily: "Nunito_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  suggTitle: { fontSize: 15, fontFamily: "Nunito_700Bold" },
  suggDesc: { fontSize: 13, fontFamily: "Nunito_400Regular", lineHeight: 20 },
});
