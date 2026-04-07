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

const FREE_FEATURES = [
  { text: "1 scan per day", included: true },
  { text: "Basic skin score (out of 10)", included: true },
  { text: "Skin age detection", included: true },
  { text: "Basic analytics", included: true },
  { text: "AI suggestions", included: false },
  { text: "Daily skin routine", included: false },
  { text: "Deep analysis report", included: false },
  { text: "Priority support", included: false },
];

const PRO_FEATURES = [
  { text: "Unlimited scans per day", included: true },
  { text: "Full skin score & analysis", included: true },
  { text: "Skin age detection", included: true },
  { text: "Deep skin analytics", included: true },
  { text: "Personalized AI suggestions", included: true },
  { text: "AI-crafted daily routine", included: true },
  { text: "Complete skin health report", included: true },
  { text: "Priority support", included: true },
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

export default function SubscribeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, setUser } = useApp();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSubscribe = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    if (user) {
      await setUser({ ...user, isPro: true });
    }
    setLoading(false);
    router.back();
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
            <Feather name="star" size={40} color={colors.gold} />
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Upgrade to{" "}
            <Text style={{ color: colors.primary }}>Glowra Pro</Text>
          </Text>
          <Text style={[styles.heroSub, { color: colors.taupe }]}>
            Unlock unlimited scans, AI-powered routines, and your complete skin health report.
          </Text>
        </View>

        {/* Plan toggle */}
        <View style={[styles.planToggle, { backgroundColor: colors.blush }]}>
          {(["monthly", "yearly"] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.planTab,
                plan === p && { backgroundColor: colors.card },
              ]}
              onPress={() => setPlan(p)}
            >
              <Text
                style={[
                  styles.planTabText,
                  {
                    color: plan === p ? colors.primary : colors.taupe,
                    fontFamily: plan === p ? "Nunito_700Bold" : "Nunito_400Regular",
                  },
                ]}
              >
                {p === "monthly" ? "Monthly" : "Yearly"}
              </Text>
              {p === "yearly" && (
                <View style={[styles.saveBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.saveBadgeText, { color: "#fff" }]}>
                    Save 40%
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Pricing cards */}
        <View style={styles.plansRow}>
          {/* Free Plan */}
          <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.planName, { color: colors.taupe }]}>Free</Text>
            <Text style={[styles.planPrice, { color: colors.foreground }]}>$0</Text>
            <Text style={[styles.planPeriod, { color: colors.taupeLight }]}>forever</Text>
            <View style={styles.featureList}>
              {FREE_FEATURES.map((f) => (
                <View key={f.text} style={styles.featureRow}>
                  <Feather
                    name={f.included ? "check" : "x"}
                    size={14}
                    color={f.included ? "#4CAF50" : colors.taupeLight}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      { color: f.included ? colors.foreground : colors.taupeLight },
                    ]}
                  >
                    {f.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pro Plan */}
          <LinearGradient
            colors={[colors.primary, colors.roseDeep]}
            style={[styles.planCard, styles.proCard]}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Most Popular</Text>
            </View>
            <Text style={[styles.planName, { color: "rgba(255,255,255,0.8)" }]}>Pro</Text>
            <Text style={[styles.planPrice, { color: "#fff" }]}>
              {plan === "monthly" ? "$9.99" : "$5.99"}
            </Text>
            <Text style={[styles.planPeriod, { color: "rgba(255,255,255,0.7)" }]}>
              per month
            </Text>
            <View style={styles.featureList}>
              {PRO_FEATURES.map((f) => (
                <View key={f.text} style={styles.featureRow}>
                  <Feather name="check" size={14} color="rgba(255,255,255,0.9)" />
                  <Text
                    style={[
                      styles.featureText,
                      { color: "rgba(255,255,255,0.9)" },
                    ]}
                  >
                    {f.text}
                  </Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Subscribe CTA */}
        <TouchableOpacity
          style={[
            styles.ctaBtn,
            { backgroundColor: loading ? colors.roseLight : colors.primary },
          ]}
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Feather name="star" size={20} color="#fff" />
          <Text style={[styles.ctaBtnText, { color: "#fff" }]}>
            {loading
              ? "Activating..."
              : plan === "monthly"
              ? "Start Pro — $9.99/month"
              : "Start Pro — $71.88/year"}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.terms, { color: colors.taupeLight }]}>
          Cancel anytime · Secure payment · 7-day free trial
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
                  <Feather key={s} name="star" size={14} color={colors.gold} />
                ))}
              </View>
              <Text style={[styles.testimonialText, { color: colors.foreground }]}>
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
  headerRow: { flexDirection: "row", justifyContent: "flex-end" },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { alignItems: "center", gap: 12 },
  starCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 28, fontFamily: "Nunito_800ExtraBold", textAlign: "center" },
  heroSub: { fontSize: 15, fontFamily: "Nunito_400Regular", textAlign: "center", lineHeight: 22 },
  planToggle: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
  },
  planTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  planTabText: { fontSize: 14 },
  saveBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  saveBadgeText: { fontSize: 10, fontFamily: "Nunito_700Bold" },
  plansRow: { flexDirection: "row", gap: 12 },
  planCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    gap: 4,
    borderWidth: 1,
    overflow: "hidden",
  },
  proCard: { borderWidth: 0 },
  popularBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  popularText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
  },
  planName: { fontSize: 14, fontFamily: "Nunito_600SemiBold" },
  planPrice: { fontSize: 32, fontFamily: "Nunito_800ExtraBold", marginTop: 4 },
  planPeriod: { fontSize: 12, fontFamily: "Nunito_400Regular", marginBottom: 8 },
  featureList: { gap: 8, marginTop: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 12, fontFamily: "Nunito_400Regular", flex: 1 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 60,
    borderRadius: 30,
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaBtnText: { fontSize: 17, fontFamily: "Nunito_700Bold" },
  terms: { fontSize: 12, fontFamily: "Nunito_400Regular", textAlign: "center" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Nunito_700Bold" },
  testimonialCard: {
    borderRadius: 18,
    padding: 16,
    gap: 8,
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  starsRow: { flexDirection: "row", gap: 2 },
  testimonialText: { fontSize: 14, fontFamily: "Nunito_400Regular", lineHeight: 22 },
  testimonialName: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
});
