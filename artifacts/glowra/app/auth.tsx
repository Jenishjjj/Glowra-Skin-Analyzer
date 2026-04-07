import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

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
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      <LinearGradient
        colors={["#F9E8E8", "#FFF8F5"]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topInset + 24, paddingBottom: bottomInset + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View
              style={[styles.logoCircle, { backgroundColor: colors.blush }]}
            >
              <Feather name="sun" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.brand, { color: colors.primary }]}>
              glowra
            </Text>
            <Text style={[styles.tagline, { color: colors.taupe }]}>
              {mode === "login"
                ? "Welcome back, beautiful."
                : "Start your skin journey today."}
            </Text>
          </View>

          <View
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <View style={styles.tabs}>
              {(["login", "register"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setMode(t)}
                  style={[
                    styles.tab,
                    t === mode && {
                      backgroundColor: colors.blush,
                      borderRadius: 12,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: t === mode ? colors.primary : colors.taupe,
                        fontFamily:
                          t === mode
                            ? "Nunito_700Bold"
                            : "Nunito_400Regular",
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
                <InputField
                  label="Your name"
                  value={name}
                  onChangeText={setName}
                  icon="user"
                  placeholder="e.g. Sophia"
                />
              )}
              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                icon="mail"
                placeholder="hello@email.com"
                keyboardType="email-address"
              />
              {mode === "register" && (
                <InputField
                  label="Your age"
                  value={age}
                  onChangeText={setAge}
                  icon="calendar"
                  placeholder="e.g. 28"
                  keyboardType="numeric"
                />
              )}
              <View>
                <Text style={[styles.label, { color: colors.textLight }]}>
                  Password
                </Text>
                <View
                  style={[
                    styles.inputRow,
                    { backgroundColor: colors.muted, borderColor: colors.border },
                  ]}
                >
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
                    <Feather
                      name={showPass ? "eye-off" : "eye"}
                      size={18}
                      color={colors.taupe}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor: loading ? colors.roseLight : colors.primary,
                },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text
                style={[styles.submitText, { color: colors.primaryForeground }]}
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              </Text>
            </TouchableOpacity>

            {mode === "login" && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={[styles.forgotText, { color: colors.taupe }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.taupeLight }]}>
              or continue with
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.socialRow}>
            {["google", "apple"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.socialBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={handleSubmit}
              >
                <Feather
                  name={s === "apple" ? "smartphone" : "globe"}
                  size={20}
                  color={colors.foreground}
                />
                <Text style={[styles.socialText, { color: colors.foreground }]}>
                  {s === "apple" ? "Apple" : "Google"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
  keyboardType,
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
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.muted, borderColor: colors.border },
        ]}
      >
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
  scroll: { paddingHorizontal: 24, gap: 20 },
  header: { alignItems: "center", gap: 8, paddingVertical: 16 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  brand: { fontSize: 36, fontFamily: "Nunito_800ExtraBold", letterSpacing: 2 },
  tagline: { fontSize: 15, fontFamily: "Nunito_400Regular" },
  card: {
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F5ECE8",
    borderRadius: 14,
    padding: 4,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabText: { fontSize: 15 },
  fields: { gap: 16 },
  label: { fontSize: 13, fontFamily: "Nunito_600SemiBold", marginBottom: 8 },
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
  submitBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { fontSize: 17, fontFamily: "Nunito_700Bold" },
  forgotBtn: { alignItems: "center" },
  forgotText: { fontSize: 14, fontFamily: "Nunito_400Regular" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontFamily: "Nunito_400Regular" },
  socialRow: { flexDirection: "row", gap: 12 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
  },
  socialText: { fontSize: 15, fontFamily: "Nunito_600SemiBold" },
});
