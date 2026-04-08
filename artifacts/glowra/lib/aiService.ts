import { Platform } from "react-native";
import { ScanResult } from "@/context/AppContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export type RoutineStep = {
  step: number;
  title: string;
  product: string;
  duration: string;
  tip: string;
};

export type SkinInsight = {
  category: string;
  title: string;
  desc: string;
  priority: "high" | "medium" | "low";
};

export type RoutineData = {
  morningSteps: RoutineStep[];
  eveningSteps: RoutineStep[];
  skinInsights: SkinInsight[];
  overallAdvice: string;
};

async function uriToBase64(uri: string): Promise<{ base64: string; mimeType: string }> {
  if (uri.startsWith("data:")) {
    const [header, base64] = uri.split(",");
    const mimeType = header.split(":")[1].split(";")[0];
    return { base64, mimeType };
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  const mimeType = blob.type || "image/jpeg";

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function analyzeSkinWithAI(imageUri: string): Promise<Partial<ScanResult>> {
  try {
    let base64: string;
    let mimeType: string;

    if (Platform.OS === "web" && imageUri) {
      const result = await uriToBase64(imageUri);
      base64 = result.base64;
      mimeType = result.mimeType;
    } else {
      throw new Error("Image conversion not supported on this platform yet");
    }

    const response = await fetch(`${API_BASE}/ai/analyze-skin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();

    return {
      skinScore: Math.round(Math.min(10, Math.max(1, data.skinScore ?? 7))),
      skinAge: Math.round(data.skinAge ?? 28),
      actualAge: Math.round(data.actualAge ?? 25),
      hydration: Math.round(Math.min(100, Math.max(0, data.hydration ?? 70))),
      pigmentation: Math.round(Math.min(100, Math.max(0, data.pigmentation ?? 65))),
      texture: Math.round(Math.min(100, Math.max(0, data.texture ?? 75))),
      pores: Math.round(Math.min(100, Math.max(0, data.pores ?? 60))),
      elasticity: Math.round(Math.min(100, Math.max(0, data.elasticity ?? 72))),
    };
  } catch (error) {
    console.warn("AI skin analysis failed, using fallback:", error);
    throw error;
  }
}

export async function generateRoutineWithAI(scan: ScanResult): Promise<RoutineData> {
  const response = await fetch(`${API_BASE}/ai/generate-routine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skinScore: scan.skinScore,
      hydration: scan.hydration,
      pigmentation: scan.pigmentation,
      texture: scan.texture,
      pores: scan.pores,
      elasticity: scan.elasticity ?? 72,
      skinAge: scan.skinAge,
      actualAge: scan.actualAge,
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
