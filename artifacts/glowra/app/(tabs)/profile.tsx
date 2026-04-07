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
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const MENU_ITEMS = [
  { icon: "bell" as const, label: "Notifications", sub: "Manage alerts", accent: "#60B4FF" },
  { icon: "shield" as const, label: "Privacy & Data", sub: "Your data settings", accent: "#4CAF50" },
  { icon: "help-circle" as const, label: "Help & Support", sub: "FAQ and contact", accent: "#A78BFA" },
  { icon: "info" as const, label: "About Glowra", sub: "Version 1.0.0", accent: "#E8738A" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, scanHistory, logout } = useApp();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const glowOp = useSharedValue(0.25);
  const avatarScale = useSharedValue(0.8);
  const avatarOpacity = useSharedValue(0);

  useEffect(() => {
    avatarScale.value = withSpring(1, { damping: 13 });
    avatarOpacity.value = withTiming(1, { duration: 500 });
    glowOp.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 2000 }), withTiming(0.25, { duration: 2000 })),
      -1
    );
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    opacity: avatarOpacity.value,
    transform: [{ scale: avatarScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOp.value }));

  const avgScore =
    scanHistory.length > 0
      ? (scanHistory.reduce((s, r) => s + r.skinScore, 0) / scanHistory.length).toFixed(1)
      : "—";

  const handleLogout = async () => {
    await logout();
    router.replace("/auth");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      {/* Dark hero header */}
      <View style={[styles.darkHero, { paddingTop: topInset + 16 }]}>
        <LinearGradient colors={[colors.dark, colors.darkSurface]} style={StyleSheet.absoluteFill} />

        {/* Decorative glow */}
        <Animated.View style={[styles.glowOrb, glowStyle]} />

        {/* Header row */}
        <View style={styles.heroHeaderRow}>
          <Text style={styles.heroHeaderTitle}>My Profile</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Feather name="settings" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <Animated.View style={[styles.avatarSection, avatarStyle]}>
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={[colors.primary, colors.roseDeep, "#8B2040"]}
              style={styles.avatar}
            >
              <Text style={styles.avatarInitial}>
                {user?.name?.charAt(0)?.toUpperCase() || "G"}
              </Text>
            </LinearGradient>
            <View style={[styles.avatarBadge, { backgroundColor: colors.dark }]}>
              <Feather name="star" size={10} color={user?.isPro ? colors.gold : "rgba(255,255,255,0.4)"} />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || "Glowra User"}</Text>
          <Text style={styles.userAge}>{user?.age ? `Age ${user.age}` : ""}</Text>
          {user?.isPro ? (
            <View style={[styles.proBadge, { backgroundColor: colors.gold + "25", borderColor: colors.gold + "50" }]}>
              <Feather name="star" size={11} color={colors.gold} />
              <Text style={[styles.proBadgeText, { color: colors.gold }]}>Pro Member</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/subscribe")}
            >
              <Feather name="zap" size={13} color="#fff" />
              <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Stats row in dark hero */}
        <View style={styles.statsRow}>
          {[
            { label: "Total Scans", value: String(scanHistory.length) },
            { label: "Avg Score", value: avgScore },
            { label: "Plan", value: user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : "Free" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 24 }]}
      >
        {/* Upgrade card for free users */}
        {!user?.isPro && (
          <TouchableOpacity onPress={() => router.push("/subscribe")} activeOpacity={0.88}>
            <LinearGradient
              colors={[colors.dark, colors.darkCard]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subscribeCard}
            >
              <View style={[styles.subIconWrap, { backgroundColor: colors.gold + "20" }]}>
                <Feather name="star" size={20} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subscribeTitle}>Unlock Glowra Pro</Text>
                <Text style={styles.subscribeSub}>Unlimited scans · AI routine · Deep insights</Text>
              </View>
              <View style={[styles.subscribeArrow, { backgroundColor: colors.primary }]}>
                <Feather name="arrow-right" size={14} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          {MENU_ITEMS.map((item, idx) => (
            <React.Fragment key={item.label}>
              {idx > 0 && <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />}
              <TouchableOpacity style={styles.menuItem}>
                <View style={[styles.menuIcon, { backgroundColor: item.accent + "18" }]}>
                  <Feather name={item.icon} size={18} color={item.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.menuSub, { color: colors.taupeLight }]}>{item.sub}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.taupeLight} />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.taupeLight }]}>
          Glowra v1.0.0 · Made with love for women
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkHero: { paddingHorizontal: 20, paddingBottom: 0, overflow: "hidden" },
  glowOrb: { position: "absolute", width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(232,115,138,0.2)", top: -60, right: -40 },
  heroHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  heroHeaderTitle: { fontSize: 16, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.7)" },
  settingsBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  avatarSection: { alignItems: "center", gap: 8, paddingBottom: 20 },
  avatarWrap: { position: "relative" },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 40, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  avatarBadge: { position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 22, fontFamily: "Nunito_700Bold", color: "#fff" },
  userAge: { fontSize: 13, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.5)" },
  proBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginTop: 4 },
  proBadgeText: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
  upgradeBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, marginTop: 4 },
  upgradeBtnText: { fontSize: 13, fontFamily: "Nunito_600SemiBold", color: "#fff" },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingVertical: 18,
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 22, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  statLabel: { fontSize: 11, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.45)" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  subscribeCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 20 },
  subIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  subscribeTitle: { fontSize: 15, fontFamily: "Nunito_700Bold", color: "#fff" },
  subscribeSub: { fontSize: 12, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  subscribeArrow: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  menuCard: { borderRadius: 20, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 15, fontFamily: "Nunito_600SemiBold" },
  menuSub: { fontSize: 12, fontFamily: "Nunito_400Regular", marginTop: 1 },
  menuDivider: { height: 1, marginLeft: 70 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, borderRadius: 27, borderWidth: 1 },
  logoutText: { fontSize: 16, fontFamily: "Nunito_600SemiBold" },
  version: { fontSize: 12, fontFamily: "Nunito_400Regular", textAlign: "center" },
});
