import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Know Your Skin,\nInside Out",
    subtitle: "Upload a selfie and let our AI reveal what your skin is really telling you — age, health, and glow score.",
    icon: "camera" as const,
    accent: "#E8738A",
  },
  {
    id: "2",
    title: "Deep Skin\nAnalytics",
    subtitle: "Get detailed insights on hydration, pigmentation, texture, and pores — all in one beautiful report.",
    icon: "bar-chart-2" as const,
    accent: "#D4A96A",
  },
  {
    id: "3",
    title: "Your Personal\nSkin Routine",
    subtitle: "AI-crafted daily skincare routines and product suggestions tailored specifically to your unique skin.",
    icon: "sun" as const,
    accent: "#E8738A",
  },
];

function Dot({ active, accent }: { active: boolean; accent: string }) {
  const anim = useAnimatedStyle(() => ({
    width: withSpring(active ? 28 : 8),
    backgroundColor: active ? accent : "rgba(255,255,255,0.3)",
  }));
  return <Animated.View style={[styles.dot, anim]} />;
}

function GlowOrb({ x, y, size, opacity: op }: { x: number; y: number; size: number; opacity: number }) {
  const anim = useSharedValue(op);
  useEffect(() => {
    anim.value = withRepeat(
      withSequence(withTiming(op * 0.4, { duration: 2000 }), withTiming(op, { duration: 2000 })),
      -1
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: anim.value }));
  return (
    <Animated.View style={[{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: "rgba(232,115,138,0.25)" }, style]} />
  );
}

function SlideContent({ item, isActive }: { item: typeof slides[0]; isActive: boolean }) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      translateY.value = withSpring(0, { damping: 16 });
      opacity.value = withTiming(1, { duration: 400 });
    } else {
      translateY.value = 30;
      opacity.value = 0;
    }
  }, [isActive]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const glowScale = useSharedValue(1);
  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(withTiming(1.12, { duration: 1800 }), withTiming(1, { duration: 1800 })),
      -1
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }] }));

  return (
    <Animated.View style={[{ width, flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }, style]}>
      <Animated.View style={[styles.iconGlowOuter, { borderColor: item.accent + "40" }, glowStyle]}>
        <LinearGradient
          colors={[item.accent + "30", item.accent + "08"]}
          style={styles.iconGlowInner}
        >
          <View style={[styles.iconCircle, { backgroundColor: item.accent + "20", borderColor: item.accent + "50" }]}>
            <Feather name={item.icon} size={56} color={item.accent} />
          </View>
        </LinearGradient>
      </Animated.View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setIsOnboarded } = useApp();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) setActiveIndex(viewableItems[0].index);
    }
  );

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      finish();
    }
  };

  const finish = async () => {
    await setIsOnboarded(true);
    router.replace("/auth");
  };

  const currentAccent = slides[activeIndex].accent;

  return (
    <View style={[styles.container, { backgroundColor: colors.dark }]}>
      <LinearGradient
        colors={[colors.dark, colors.darkSurface, colors.dark]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative orbs */}
      <GlowOrb x={-40} y={height * 0.1} size={200} opacity={0.6} />
      <GlowOrb x={width * 0.6} y={height * 0.05} size={150} opacity={0.4} />
      <GlowOrb x={width * 0.2} y={height * 0.55} size={180} opacity={0.35} />

      {/* Logo */}
      <View style={[styles.logoRow, { paddingTop: topInset + 12 }]}>
        <Text style={styles.logoText}>glowra</Text>
        <TouchableOpacity style={styles.skipBtn} onPress={finish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item, index }) => (
          <View style={{ width, flex: 1 }}>
            <SlideContent item={item} isActive={index === activeIndex} />
          </View>
        )}
        style={{ flex: 1 }}
      />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: bottomInset + 24 }]}>
        <View style={styles.dotsRow}>
          {slides.map((s, i) => (
            <Dot key={i} active={i === activeIndex} accent={currentAccent} />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: currentAccent }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>
            {activeIndex === slides.length - 1 ? "Get Started" : "Continue"}
          </Text>
          <View style={styles.ctaArrow}>
            <Feather
              name={activeIndex === slides.length - 1 ? "check" : "arrow-right"}
              size={18}
              color={currentAccent}
            />
          </View>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Your skin, your story — backed by AI
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
  logoText: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: "#fff",
    letterSpacing: 2,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  skipText: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Nunito_500Medium" },
  iconGlowOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 44,
  },
  iconGlowInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  slideTitle: {
    fontSize: 34,
    fontFamily: "Nunito_800ExtraBold",
    color: "#fff",
    textAlign: "center",
    lineHeight: 42,
    marginBottom: 20,
  },
  slideSubtitle: {
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: { paddingHorizontal: 28, gap: 20 },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  ctaBtn: {
    height: 58,
    borderRadius: 29,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    paddingHorizontal: 24,
  },
  ctaBtnText: { fontSize: 17, fontFamily: "Nunito_700Bold", color: "#fff", flex: 1, textAlign: "center" },
  ctaArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  footerNote: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
  },
});
