import { ScanResult } from "@/context/AppContext";
import { supabase } from "./supabase";

// ── DB row type ───────────────────────────────────────────────────────────────
type ScanRow = {
  id: string;
  user_id: string;
  skin_score: number;
  skin_age: number;
  actual_age: number;
  hydration: number;
  pigmentation: number;
  texture: number;
  pores: number;
  elasticity: number;
  image_uri: string | null;
  created_at: string;
};

function rowToScanResult(row: ScanRow): ScanResult {
  return {
    id: row.id,
    date: row.created_at,
    skinScore: row.skin_score,
    skinAge: row.skin_age,
    actualAge: row.actual_age,
    hydration: row.hydration,
    pigmentation: row.pigmentation,
    texture: row.texture,
    pores: row.pores,
    elasticity: row.elasticity ?? 70,
    imageUri: row.image_uri ?? undefined,
  };
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function saveScan(userId: string, scan: ScanResult): Promise<void> {
  const { error } = await supabase.from("scan_results").insert({
    id: scan.id,
    user_id: userId,
    skin_score: scan.skinScore,
    skin_age: scan.skinAge,
    actual_age: scan.actualAge,
    hydration: scan.hydration,
    pigmentation: scan.pigmentation,
    texture: scan.texture,
    pores: scan.pores,
    elasticity: scan.elasticity,
    image_uri: scan.imageUri ?? null,
    created_at: scan.date,
  });
  if (error) throw error;
}

export async function fetchScans(userId: string, limit = 50): Promise<ScanResult[]> {
  const { data, error } = await supabase
    .from("scan_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as ScanRow[]).map(rowToScanResult);
}

export async function deleteScan(scanId: string): Promise<void> {
  const { error } = await supabase.from("scan_results").delete().eq("id", scanId);
  if (error) throw error;
}
