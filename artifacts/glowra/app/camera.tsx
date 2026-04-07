import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
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
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

const TIPS_CAMERA = [
  "Look straight at the camera",
  "Ensure good, even lighting",
  "Remove glasses & accessories",
  "Keep a neutral expression",
];

export default function CameraScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const pulse = useSharedValue(1);
  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1
    );

    const iv = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS_CAMERA.length);
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takeSelfie = async () => {
    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const analyze = () => {
    router.replace({ pathname: "/analyzing", params: { imageUri: selectedImage || "" } });
  };

  return (
    <View style={[styles.container, { backgroundColor: "#1a0a0a" }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#2D0F15", "#1a0a0a"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Face Scan</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Frame */}
      <View style={styles.frameArea}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <Animated.View style={[styles.faceFrame, pulseStyle]}>
            <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
            <View style={styles.faceFrameCenter}>
              <Feather name="user" size={80} color="rgba(232,115,138,0.4)" />
              <Text style={styles.frameHint}>Position your face here</Text>
            </View>
          </Animated.View>
        )}

        {/* Tip */}
        <View style={[styles.tipBadge, { backgroundColor: "rgba(232,115,138,0.15)" }]}>
          <Feather name="info" size={14} color={colors.roseLight} />
          <Text style={[styles.tipText, { color: colors.roseLight }]}>
            {TIPS_CAMERA[tipIndex]}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: bottomInset + 24 }]}>
        {selectedImage ? (
          <>
            <TouchableOpacity
              style={[styles.retakeBtn, { borderColor: "rgba(255,255,255,0.3)" }]}
              onPress={() => setSelectedImage(null)}
            >
              <Feather name="refresh-cw" size={20} color="#fff" />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.analyzeBtn, { backgroundColor: colors.primary }]}
              onPress={analyze}
              activeOpacity={0.85}
            >
              <Feather name="zap" size={20} color="#fff" />
              <Text style={styles.analyzeBtnText}>Analyze Skin</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.galleryBtn, { borderColor: "rgba(255,255,255,0.3)" }]}
              onPress={pickImage}
            >
              <Feather name="image" size={22} color="#fff" />
              <Text style={styles.galleryBtnText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shutterBtn]}
              onPress={Platform.OS === "web" ? pickImage : takeSelfie}
            >
              <LinearGradient
                colors={[colors.primary, colors.roseDeep]}
                style={styles.shutterGrad}
              >
                <Feather name="camera" size={32} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ width: 72 }} />
          </>
        )}
      </View>
    </View>
  );
}

const FRAME_SIZE = Math.min(width, height) * 0.65;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: "#fff",
  },
  frameArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  faceFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE * 1.2,
    borderRadius: FRAME_SIZE * 0.5,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  faceFrameCenter: { alignItems: "center", gap: 12 },
  frameHint: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Nunito_500Medium",
    fontSize: 14,
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderWidth: 3,
  },
  cornerTL: { top: 16, left: 16, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 16, right: 16, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 16, left: 16, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 16, right: 16, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  previewImage: {
    width: FRAME_SIZE,
    height: FRAME_SIZE * 1.2,
    borderRadius: FRAME_SIZE * 0.5,
  },
  tipBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tipText: { fontSize: 14, fontFamily: "Nunito_500Medium" },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 32,
    paddingTop: 12,
  },
  galleryBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  galleryBtnText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Nunito_500Medium",
  },
  shutterBtn: {
    shadowColor: "#E8738A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  shutterGrad: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  retakeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
  },
  retakeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
  },
  analyzeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 28,
  },
  analyzeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
});
