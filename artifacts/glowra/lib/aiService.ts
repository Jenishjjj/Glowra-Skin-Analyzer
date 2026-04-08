import { ScanResult } from "@/context/AppContext";
import { clearPendingImage, getPendingImage } from "@/lib/pendingImage";

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

export async function analyzeSkinWithAI(): Promise<Partial<ScanResult>> {
  const { base64, mimeType } = getPendingImage();

  if (!base64) {
    throw new Error("No image available for AI analysis");
  }

  const response = await fetch(`${API_BASE}/ai/analyze-skin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  clearPendingImage();

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
