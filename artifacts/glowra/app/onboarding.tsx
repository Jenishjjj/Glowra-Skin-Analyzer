import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
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
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Know Your Skin,\nInside Out",
    subtitle:
      "Upload a selfie and let our AI reveal what your skin is really telling you — age, health, and glow score.",
    icon: "camera" as const,
  },
  {
    id: "2",
    title: "Deep Skin\nAnalytics",
    subtitle:
      "Get detailed insights on hydration, pigmentation, texture, and pores — all in one beautiful report.",
    icon: "bar-chart-2" as const,
  },
  {
    id: "3",
    title: "Your Personal\nSkin Routine",
    subtitle:
      "AI-crafted daily skincare routines and product suggestions tailored specifically to your unique skin.",
    icon: "sun" as const,
  },
];

function Dot({ active }: { active: boolean }) {
  const colors = useColors();
  const anim = useAnimatedStyle(() => ({
    width: withSpring(active ? 24 : 8),
    backgroundColor: active ? colors.primary : colors.roseLight,
  }));
  return <Animated.View style={[styles.dot, anim]} />;
}

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setIsOnboarded } = useApp();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index);
      }
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

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      <LinearGradient
        colors={["#F9E8E8", "#FFF8F5", "#FFF8F5"]}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity
        style={[styles.skipBtn, { top: topInset + 12 }]}
        onPress={finish}
      >
        <Text style={[styles.skipText, { color: colors.taupe }]}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.blush },
              ]}
            >
              <View
                style={[
                  styles.iconInner,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Feather
                  name={item.icon}
                  size={52}
                  color={colors.primary}
                />
              </View>
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.taupe }]}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: bottomInset + 24 }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Dot key={i} active={i === activeIndex} />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
            {activeIndex === slides.length - 1 ? "Get Started" : "Continue"}
          </Text>
          <Feather
            name={activeIndex === slides.length - 1 ? "check" : "arrow-right"}
            size={20}
            color={colors.primaryForeground}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: "absolute", right: 24, zIndex: 10 },
  skipText: { fontSize: 15, fontFamily: "Nunito_500Medium" },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  iconInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 32,
    gap: 24,
  },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 28,
  },
  btnText: { fontSize: 17, fontFamily: "Nunito_700Bold" },
});
