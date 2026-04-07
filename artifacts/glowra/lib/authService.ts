import { supabase } from "./supabase";

export type Profile = {
  id: string;
  email: string;
  name: string;
  age: number;
  plan: "free" | "plus" | "pro";
  scans_today: number;
  last_scan_date: string;
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, name: string, age: number) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, age },
    },
  });
  if (error) throw error;

  // The DB trigger auto-creates a minimal profile row on INSERT into auth.users.
  // We upsert here to ensure name + age are stored correctly regardless of timing.
  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        { id: data.user.id, email, name, age, plan: "free" },
        { onConflict: "id" }
      );
    if (profileError) {
      console.warn("Profile upsert warning:", profileError.message);
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Omit<Profile, "id">>) {
  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}
