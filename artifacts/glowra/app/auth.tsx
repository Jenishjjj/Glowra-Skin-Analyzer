import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

const { height } = Dimensions.get("window");

export default function AuthScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setIsLoggedIn, setUser } = useApp();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  // Entrance animation
  const cardY = useSharedValue(60);
  const cardOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);

  // Glow pulse on logo
  const glowScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 14 });
    logoOpacity.value = withTiming(1, { duration: 500 });
    cardY.value = withDelay(200, withSpring(0, { damping: 18 }));
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    glowScale.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 2000 }), withTiming(1, { duration: 2000 })),
      -1
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    await setUser({
      name: name || "Glowra User",
      age: parseInt(age) || 25,
      isPro: false,
      scansToday: 0,
      lastScanDate: "",
    });
    await setIsLoggedIn(true);
    setLoading(false);
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.dark }]}>
      {/* Dark header bg */}
      <LinearGradient
        colors={[colors.dark, colors.darkSurface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow orb behind logo */}
      <Animated.View style={[styles.glowOrb, glowStyle]} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topInset + 20, paddingBottom: bottomInset + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo section on dark bg */}
          <Animated.View style={[styles.logoSection, logoStyle]}>
            <View style={styles.logoIconWrap}>
              <LinearGradient
                colors={[colors.primary, colors.roseDeep]}
                style={styles.logoIconGrad}
              >
                <Feather name="sun" size={36} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>glowra</Text>
            <Text style={styles.tagline}>
              {mode === "login" ? "Welcome back, beautiful." : "Start your glow journey today."}
            </Text>

            {/* Feature pills */}
            <View style={styles.pillRow}>
              {["AI Powered", "Skin Expert", "10M+ Users"].map((p) => (
                <View key={p} style={styles.pill}>
                  <Text style={styles.pillText}>{p}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* White form card */}
          <Animated.View style={[styles.formCard, { backgroundColor: colors.card }, cardStyle]}>
            {/* Tab switcher */}
            <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
              {(["login", "register"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setMode(t)}
                  style={[
                    styles.tab,
                    t === mode && { backgroundColor: colors.primary, borderRadius: 12 },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: t === mode ? "#fff" : colors.taupe,
                        fontFamily: t === mode ? "Nunito_700Bold" : "Nunito_500Medium",
                      },
                    ]}
                  >
                    {t === "login" ? "Sign In" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.fields}>
              {mode === "register" && (
                <InputField label="Your name" value={name} onChangeText={setName} icon="user" placeholder="e.g. Sophia" />
              )}
              <InputField label="Email address" value={email} onChangeText={setEmail} icon="mail" placeholder="hello@email.com" keyboardType="email-address" />
              {mode === "register" && (
                <InputField label="Your age" value={age} onChangeText={setAge} icon="calendar" placeholder="e.g. 28" keyboardType="numeric" />
              )}
              <View>
                <Text style={[styles.label, { color: colors.textLight }]}>Password</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <Feather name="lock" size={18} color={colors.taupe} />
                  <TextInput
                    style={[styles.inputText, { color: colors.foreground }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.taupeLight}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass((p) => !p)}>
                    <Feather name={showPass ? "eye-off" : "eye"} size={18} color={colors.taupe} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: loading ? colors.roseLight : colors.primary }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={[styles.submitText, { color: "#fff" }]}>
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </Text>
            </TouchableOpacity>

            {mode === "login" && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={[styles.forgotText, { color: colors.taupe }]}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.taupeLight }]}>or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.socialRow}>
              {[
                { key: "google", icon: "globe" as const, label: "Google" },
                { key: "apple", icon: "smartphone" as const, label: "Apple" },
              ].map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.socialBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                  onPress={handleSubmit}
                >
                  <Feather name={s.icon} size={18} color={colors.foreground} />
                  <Text style={[styles.socialText, { color: colors.foreground }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function InputField({
  label, value, onChangeText, icon, placeholder, keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  icon: React.ComponentProps<typeof Feather>["name"];
  placeholder: string;
  keyboardType?: "default" | "email-address" | "numeric";
}) {
  const colors = useColors();
  return (
    <View>
      <Text style={[styles.label, { color: colors.textLight }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name={icon} size={18} color={colors.taupe} />
        <TextInput
          style={[styles.inputText, { color: colors.foreground }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.taupeLight}
          keyboardType={keyboardType || "default"}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 24 },
  glowOrb: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(232,115,138,0.12)",
    top: -60,
    left: "50%",
    marginLeft: -150,
  },
  logoSection: { alignItems: "center", gap: 12, paddingBottom: 8 },
  logoIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: "rgba(232,115,138,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconGrad: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 38,
    fontFamily: "Nunito_800ExtraBold",
    color: "#fff",
    letterSpacing: 3,
  },
  tagline: { fontSize: 15, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.55)" },
  pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  pillText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Nunito_500Medium" },
  formCard: {
    borderRadius: 28,
    padding: 24,
    gap: 18,
  },
  tabs: { flexDirection: "row", borderRadius: 14, padding: 4 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 11 },
  tabText: { fontSize: 15 },
  fields: { gap: 14 },
  label: { fontSize: 12, fontFamily: "Nunito_600SemiBold", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
  },
  inputText: { flex: 1, fontSize: 15, fontFamily: "Nunito_400Regular" },
  submitBtn: { height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 17, fontFamily: "Nunito_700Bold" },
  forgotBtn: { alignItems: "center" },
  forgotText: { fontSize: 14, fontFamily: "Nunito_400Regular" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontFamily: "Nunito_400Regular" },
  socialRow: { flexDirection: "row", gap: 12 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
  },
  socialText: { fontSize: 14, fontFamily: "Nunito_600SemiBold" },
  termsText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
  },
});
