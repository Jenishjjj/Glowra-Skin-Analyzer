import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
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

const MENU_ITEMS = [
  { icon: "bell" as const, label: "Notifications", sub: "Manage alerts" },
  { icon: "shield" as const, label: "Privacy & Data", sub: "Your data settings" },
  { icon: "help-circle" as const, label: "Help & Support", sub: "FAQ and contact" },
  { icon: "info" as const, label: "About Glowra", sub: "Version 1.0.0" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, scanHistory, setIsLoggedIn, setUser } = useApp();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const avgScore =
    scanHistory.length > 0
      ? (
          scanHistory.reduce((s, r) => s + r.skinScore, 0) / scanHistory.length
        ).toFixed(1)
      : "—";

  const handleLogout = async () => {
    await setIsLoggedIn(false);
    router.replace("/auth");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 24 },
        ]}
      >
        {/* Avatar and name */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[colors.primary, colors.roseDeep]}
            style={styles.avatar}
          >
            <Text style={styles.avatarInitial}>
              {user?.name?.charAt(0)?.toUpperCase() || "G"}
            </Text>
          </LinearGradient>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {user?.name || "Glowra User"}
          </Text>
          <Text style={[styles.userAge, { color: colors.taupe }]}>
            {user?.age ? `Age ${user.age}` : ""}
          </Text>
          {user?.isPro ? (
            <View style={[styles.proBadge, { backgroundColor: colors.goldLight }]}>
              <Feather name="star" size={12} color={colors.gold} />
              <Text style={[styles.proBadgeText, { color: colors.gold }]}>
                Pro Member
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/subscribe")}
            >
              <Feather name="star" size={14} color="#fff" />
              <Text style={[styles.upgradeBtnText, { color: "#fff" }]}>
                Upgrade to Pro
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          {[
            { label: "Total Scans", value: String(scanHistory.length) },
            { label: "Avg Skin Score", value: avgScore },
            { label: "Plan", value: user?.isPro ? "Pro" : "Free" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && (
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              )}
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {s.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.taupe }]}>
                  {s.label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Subscription Card */}
        {!user?.isPro && (
          <TouchableOpacity onPress={() => router.push("/subscribe")}>
            <LinearGradient
              colors={[colors.primary, colors.roseDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subscribeCard}
            >
              <View>
                <Text style={[styles.subscribeTitle, { color: "#fff" }]}>
                  Unlock Glowra Pro
                </Text>
                <Text style={[styles.subscribeSub, { color: "rgba(255,255,255,0.8)" }]}>
                  Unlimited scans, AI routines & more
                </Text>
              </View>
              <View style={[styles.subscribePrice, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Text style={[styles.subscribePriceText, { color: "#fff" }]}>
                  $9.99/mo
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          {MENU_ITEMS.map((item, idx) => (
            <React.Fragment key={item.label}>
              {idx > 0 && (
                <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
              )}
              <TouchableOpacity style={styles.menuItem}>
                <View
                  style={[styles.menuIcon, { backgroundColor: colors.blush }]}
                >
                  <Feather name={item.icon} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, { color: colors.foreground }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.menuSub, { color: colors.taupeLight }]}>
                    {item.sub}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.taupeLight} />
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
          <Text style={[styles.logoutText, { color: colors.destructive }]}>
            Sign Out
          </Text>
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
  scroll: { paddingHorizontal: 20, gap: 20 },
  avatarSection: { alignItems: "center", gap: 8, paddingVertical: 8 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarInitial: { fontSize: 40, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  userName: { fontSize: 24, fontFamily: "Nunito_700Bold" },
  userAge: { fontSize: 14, fontFamily: "Nunito_400Regular" },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  proBadgeText: { fontSize: 13, fontFamily: "Nunito_600SemiBold" },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  upgradeBtnText: { fontSize: 14, fontFamily: "Nunito_600SemiBold" },
  statsCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { alignItems: "center", gap: 2 },
  statValue: { fontSize: 24, fontFamily: "Nunito_800ExtraBold" },
  statLabel: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  statDivider: { width: 1, height: 40 },
  subscribeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 20,
  },
  subscribeTitle: { fontSize: 17, fontFamily: "Nunito_700Bold" },
  subscribeSub: { fontSize: 13, fontFamily: "Nunito_400Regular", marginTop: 2 },
  subscribePrice: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  subscribePriceText: { fontSize: 14, fontFamily: "Nunito_700Bold" },
  menuCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 15, fontFamily: "Nunito_600SemiBold" },
  menuSub: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  menuDivider: { height: 1, marginLeft: 70 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
  },
  logoutText: { fontSize: 16, fontFamily: "Nunito_600SemiBold" },
  version: { fontSize: 12, fontFamily: "Nunito_400Regular", textAlign: "center" },
});
