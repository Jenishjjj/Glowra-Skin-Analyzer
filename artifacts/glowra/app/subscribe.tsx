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

type BillingCycle = "monthly" | "yearly";
type PlanKey = "free" | "plus" | "pro";

type Feature = {
  text: string;
  included: boolean | "partial";
  note?: string;
};

const PLANS: {
  key: PlanKey;
  name: string;
  subtitle: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlySub: string;
  badge?: string;
  badgeIcon?: React.ComponentProps<typeof Feather>["name"];
  features: Feature[];
}[] = [
  {
    key: "free",
    name: "Glowra Lite",
    subtitle: "Get a taste of glowing skin",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    yearlySub: "forever free",
    features: [
      { text: "1 scan per day", included: true },
      { text: "Skin score (out of 10)", included: true },
      { text: "Skin age detection", included: true },
      { text: "2 skin analytics visible", included: "partial", note: "Others hidden" },
      { text: "AI suggestions", included: false },
      { text: "Daily skin routine", included: false },
    ],
  },
  {
    key: "plus",
    name: "Glowra Plus",
    subtitle: "Perfect for getting started",
    monthlyPrice: "$5.99",
    yearlyPrice: "$4.92",
    yearlySub: "$59/year · save 20%",
    features: [
      { text: "5 scans per day", included: true },
      { text: "Skin score + full analytics", included: true },
      { text: "Skin age detection", included: true },
      { text: "All 4 analytics visible", included: true },
      { text: "Basic AI tips", included: "partial", note: "Short tips only" },
      { text: "Daily skin routine", included: false },
    ],
  },
  {
    key: "pro",
    name: "Glowra Pro",
    subtitle: "Best results, full power",
    monthlyPrice: "$12.99",
    yearlyPrice: "$8.25",
    yearlySub: "$99/year · best deal",
    badge: "Most Popular",
    badgeIcon: "star",
    features: [
      { text: "Unlimited scans per day", included: true },
      { text: "Full analytics + tracking", included: true },
      { text: "Skin age detection", included: true },
      { text: "All 4 analytics visible", included: true },
      { text: "Advanced AI suggestions", included: true },
      { text: "Personalized daily routine", included: true },
    ],
  },
];

const TESTIMONIALS = [
  {
    name: "Sophia R.",
    age: 29,
    text: "Glowra helped me understand exactly what my skin needs. My hydration improved so much in just 3 weeks!",
  },
  {
    name: "Mia K.",
    age: 34,
    text: "The AI routine is spot on. I stopped guessing and now my skin actually glows. Worth every penny.",
  },
];

function FeatureRow({
  feature,
  isPro,
}: {
  feature: Feature;
  isPro: boolean;
}) {
  const colors = useColors();

  const iconName =
    feature.included === true
      ? "check"
      : feature.included === "partial"
      ? "minus"
      : "x";

  const iconColor = isPro
    ? feature.included === true
      ? "rgba(255,255,255,0.95)"
      : feature.included === "partial"
      ? "rgba(255,255,255,0.6)"
      : "rgba(255,255,255,0.3)"
    : feature.included === true
    ? "#4CAF50"
    : feature.included === "partial"
    ? colors.gold
    : colors.taupeLight;

  const textColor = isPro
    ? feature.included !== false
      ? "rgba(255,255,255,0.9)"
      : "rgba(255,255,255,0.35)"
    : feature.included !== false
    ? colors.foreground
    : colors.taupeLight;

  return (
    <View style={styles.featureRow}>
      <Feather name={iconName} size={13} color={iconColor} />
      <Text style={[styles.featureText, { color: textColor }]}>
        {feature.text}
        {feature.note && (
          <Text
            style={[
              styles.featureNote,
              { color: isPro ? "rgba(255,255,255,0.5)" : colors.taupeLight },
            ]}
          >
            {" "}· {feature.note}
          </Text>
        )}
      </Text>
    </View>
  );
}

export default function SubscribeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, setUser } = useApp();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("pro");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const handleSubscribe = async (planKey: PlanKey) => {
    if (planKey === "free") {
      router.back();
      return;
    }
    setLoading(planKey);
    setUpgradeError(null);
    try {
      if (user) {
        const updatedUser = {
          ...user,
          plan: planKey,
          isPro: planKey === "pro" || planKey === "plus",
        };
        await setUser(updatedUser);
      }
      router.back();
    } catch (e: any) {
      setUpgradeError(e?.message || "Upgrade failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const getCtaLabel = (planKey: PlanKey) => {
    if (planKey === "free") return "Continue with Free";
    const plan = PLANS.find((p) => p.key === planKey)!;
    const price =
      billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
    const period = billing === "monthly" ? "/mo" : "/mo billed yearly";
    if (loading === planKey) return "Activating...";
    return `Get ${plan.name} — ${price}${period}`;
  };

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
            style={[styles.closeBtn, { backgroundColor: colors.blush }]}
            onPress={() => router.back()}
          >
            <Feather name="x" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[colors.goldLight, colors.blush]}
            style={styles.starCircle}
          >
            <Feather name="star" size={36} color={colors.gold} />
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Choose Your{" "}
            <Text style={{ color: colors.primary }}>Glow Plan</Text>
          </Text>
          <Text style={[styles.heroSub, { color: colors.taupe }]}>
            Upgrade anytime. Cancel anytime. Your skin, your rules.
          </Text>
        </View>

        {/* Billing toggle */}
        <View style={[styles.billingToggle, { backgroundColor: colors.blush }]}>
          {(["monthly", "yearly"] as const).map((b) => (
            <TouchableOpacity
              key={b}
              style={[
                styles.billingTab,
                billing === b && { backgroundColor: colors.card },
              ]}
              onPress={() => setBilling(b)}
            >
              <Text
                style={[
                  styles.billingTabText,
                  {
                    color: billing === b ? colors.primary : colors.taupe,
                    fontFamily:
                      billing === b ? "Nunito_700Bold" : "Nunito_500Medium",
                  },
                ]}
              >
                {b === "monthly" ? "Monthly" : "Yearly"}
              </Text>
              {b === "yearly" && (
                <View
                  style={[
                    styles.savePill,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.savePillText}>Save up to 37%</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Plan Cards — stacked */}
        <View style={styles.plansList}>
          {PLANS.map((plan) => {
            const isPro = plan.key === "pro";
            const isPlus = plan.key === "plus";
            const isFree = plan.key === "free";
            const isSelected = selectedPlan === plan.key;
            const price =
              billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const isLoading = loading === plan.key;

            if (isPro) {
              return (
                <TouchableOpacity
                  key={plan.key}
                  onPress={() => setSelectedPlan(plan.key)}
                  activeOpacity={0.92}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.roseDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.planCard, styles.proCard]}
                  >
                    {/* Top row */}
                    <View style={styles.planTopRow}>
                      <View>
                        <View style={styles.proBadgeRow}>
                          <View style={styles.popularBadge}>
                            <Feather
                              name="star"
                              size={10}
                              color={colors.gold}
                            />
                            <Text style={styles.popularText}>
                              Most Popular · Best Results
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.planName, { color: "#fff", marginTop: 8 }]}>
                          {plan.name}
                        </Text>
                        <Text
                          style={[
                            styles.planSubtitle,
                            { color: "rgba(255,255,255,0.75)" },
                          ]}
                        >
                          {plan.subtitle}
                        </Text>
                      </View>
                      <View style={styles.priceBlock}>
                        <Text style={[styles.priceMain, { color: "#fff" }]}>
                          {price}
                        </Text>
                        <Text
                          style={[
                            styles.pricePeriod,
                            { color: "rgba(255,255,255,0.7)" },
                          ]}
                        >
                          /mo
                        </Text>
                      </View>
                    </View>

                    {billing === "yearly" && (
                      <View style={styles.annualBadge}>
                        <Feather
                          name="zap"
                          size={11}
                          color={colors.gold}
                        />
                        <Text style={[styles.annualBadgeText, { color: colors.gold }]}>
                          {plan.yearlySub}
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: "rgba(255,255,255,0.15)" },
                      ]}
                    />

                    <View style={styles.featureList}>
                      {plan.features.map((f) => (
                        <FeatureRow key={f.text} feature={f} isPro={true} />
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.planCta,
                        {
                          backgroundColor: isLoading
                            ? "rgba(255,255,255,0.2)"
                            : "#fff",
                        },
                      ]}
                      onPress={() => handleSubscribe(plan.key)}
                      disabled={isLoading}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.planCtaText,
                          { color: isLoading ? "#fff" : colors.primary },
                        ]}
                      >
                        {getCtaLabel(plan.key)}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={plan.key}
                onPress={() => setSelectedPlan(plan.key)}
                activeOpacity={0.92}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected
                      ? colors.primary
                      : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                {/* Top row */}
                <View style={styles.planTopRow}>
                  <View style={{ flex: 1 }}>
                    {isPlus && (
                      <View
                        style={[
                          styles.entryBadge,
                          { backgroundColor: colors.goldLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.entryBadgeText,
                            { color: colors.gold },
                          ]}
                        >
                          Entry Tier
                        </Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.planName,
                        { color: colors.foreground, marginTop: isPlus ? 6 : 0 },
                      ]}
                    >
                      {plan.name}
                    </Text>
                    <Text style={[styles.planSubtitle, { color: colors.taupe }]}>
                      {plan.subtitle}
                    </Text>
                  </View>
                  <View style={styles.priceBlock}>
                    <Text
                      style={[
                        styles.priceMain,
                        { color: isFree ? colors.taupe : colors.foreground },
                      ]}
                    >
                      {price}
                    </Text>
                    {!isFree && (
                      <Text
                        style={[
                          styles.pricePeriod,
                          { color: colors.taupeLight },
                        ]}
                      >
                        /mo
                      </Text>
                    )}
                  </View>
                </View>

                {isPlus && billing === "yearly" && (
                  <View
                    style={[
                      styles.annualBadge,
                      { backgroundColor: colors.goldLight },
                    ]}
                  >
                    <Feather name="zap" size={11} color={colors.gold} />
                    <Text
                      style={[styles.annualBadgeText, { color: colors.gold }]}
                    >
                      {plan.yearlySub}
                    </Text>
                  </View>
                )}

                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />

                <View style={styles.featureList}>
                  {plan.features.map((f) => (
                    <FeatureRow key={f.text} feature={f} isPro={false} />
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.planCta,
                    {
                      backgroundColor: isFree
                        ? colors.muted
                        : isLoading
                        ? colors.roseLight
                        : colors.primary,
                    },
                  ]}
                  onPress={() => handleSubscribe(plan.key)}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.planCtaText,
                      {
                        color: isFree
                          ? colors.taupe
                          : "#fff",
                      },
                    ]}
                  >
                    {getCtaLabel(plan.key)}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        {upgradeError && (
          <View style={[styles.errorBanner, { backgroundColor: "#FFE8E8" }]}>
            <Feather name="alert-circle" size={14} color="#C0392B" />
            <Text style={styles.errorBannerText}>{upgradeError}</Text>
          </View>
        )}

        {/* Annual deal callout */}
        {billing === "monthly" && (
          <TouchableOpacity onPress={() => setBilling("yearly")}>
            <LinearGradient
              colors={[colors.goldLight, "#FFF8F5"]}
              style={[styles.annualCallout, { borderColor: colors.gold }]}
            >
              <Feather name="zap" size={16} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.annualCalloutTitle, { color: colors.foreground }]}>
                  Switch to Yearly & Save
                </Text>
                <Text style={[styles.annualCalloutSub, { color: colors.taupe }]}>
                  Pro yearly at $99 · Plus yearly at $59
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.gold} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={[styles.terms, { color: colors.taupeLight }]}>
          Cancel anytime · Secure payment · 7-day free trial on paid plans
        </Text>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            What our users say
          </Text>
          {TESTIMONIALS.map((t) => (
            <View
              key={t.name}
              style={[styles.testimonialCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Feather key={s} name="star" size={13} color={colors.gold} />
                ))}
              </View>
              <Text
                style={[styles.testimonialText, { color: colors.foreground }]}
              >
                "{t.text}"
              </Text>
              <Text style={[styles.testimonialName, { color: colors.taupe }]}>
                — {t.name}, {t.age}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 20 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  errorBannerText: { fontSize: 13, fontFamily: "Nunito_500Medium", color: "#C0392B", flex: 1 },
  headerRow: { flexDirection: "row", justifyContent: "flex-end" },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { alignItems: "center", gap: 10 },
  starCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  billingToggle: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
  },
  billingTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  billingTabText: { fontSize: 14 },
  savePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savePillText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Nunito_700Bold",
  },
  plansList: { gap: 14 },
  planCard: {
    borderRadius: 24,
    padding: 20,
    gap: 14,
    overflow: "hidden",
  },
  proCard: {
    borderWidth: 0,
  },
  planTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  proBadgeRow: { flexDirection: "row" },
  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  popularText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
  },
  entryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  entryBadgeText: { fontSize: 10, fontFamily: "Nunito_700Bold" },
  planName: { fontSize: 18, fontFamily: "Nunito_800ExtraBold" },
  planSubtitle: { fontSize: 12, fontFamily: "Nunito_400Regular", marginTop: 2 },
  priceBlock: { alignItems: "flex-end" },
  priceMain: { fontSize: 30, fontFamily: "Nunito_800ExtraBold" },
  pricePeriod: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  annualBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start",
  },
  annualBadgeText: { fontSize: 11, fontFamily: "Nunito_600SemiBold" },
  divider: { height: 1 },
  featureList: { gap: 10 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: { fontSize: 13, fontFamily: "Nunito_500Medium", flex: 1 },
  featureNote: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  planCta: {
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  planCtaText: { fontSize: 14, fontFamily: "Nunito_700Bold" },
  annualCallout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  annualCalloutTitle: { fontSize: 14, fontFamily: "Nunito_700Bold" },
  annualCalloutSub: { fontSize: 12, fontFamily: "Nunito_400Regular", marginTop: 1 },
  terms: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
  },
  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Nunito_700Bold" },
  testimonialCard: {
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  starsRow: { flexDirection: "row", gap: 2 },
  testimonialText: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    lineHeight: 20,
  },
  testimonialName: { fontSize: 12, fontFamily: "Nunito_600SemiBold" },
});
