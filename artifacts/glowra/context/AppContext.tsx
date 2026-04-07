import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import {
  fetchProfile,
  getCurrentUser,
  getSession,
  Profile,
  signOut,
  updateProfile,
} from "@/lib/authService";
import { fetchScans, saveScan } from "@/lib/scanService";
import { supabase } from "@/lib/supabase";

export type ScanResult = {
  id: string;
  date: string;
  skinScore: number;
  skinAge: number;
  actualAge: number;
  hydration: number;
  pigmentation: number;
  texture: number;
  pores: number;
  elasticity: number;
  imageUri?: string;
};

type User = {
  id: string;
  email: string;
  name: string;
  age: number;
  isPro: boolean;
  plan: "free" | "plus" | "pro";
  scansToday: number;
  lastScanDate: string;
};

type AppContextType = {
  user: User | null;
  setUser: (u: User) => Promise<void>;
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  scanHistory: ScanResult[];
  addScan: (scan: ScanResult) => Promise<void>;
  deleteScanById: (id: string) => Promise<void>;
  currentScan: ScanResult | null;
  setCurrentScan: (scan: ScanResult | null) => void;
  canScanToday: boolean;
  logout: () => Promise<void>;
  refreshScans: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

function profileToUser(profile: Profile, userId: string): User {
  return {
    id: userId,
    email: profile.email ?? "",
    name: profile.name,
    age: profile.age,
    plan: profile.plan,
    isPro: profile.plan === "pro" || profile.plan === "plus",
    scansToday: profile.scans_today,
    lastScanDate: profile.last_scan_date,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [isLoggedIn, setIsLoggedInState] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  // ── Bootstrap: restore onboarded flag + check Supabase session ──────────────
  useEffect(() => {
    (async () => {
      try {
        const onb = await AsyncStorage.getItem("isOnboarded");
        if (onb === "true") setIsOnboardedState(true);

        const session = await getSession();
        if (session?.user) {
          await loadUserData(session.user.id);
        }
      } finally {
        setLoaded(true);
      }
    })();

    // Listen for auth state changes (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await loadUserData(session.user.id);
        setIsLoggedInState(true);
      } else if (event === "SIGNED_OUT") {
        setUserState(null);
        setScanHistory([]);
        setIsLoggedInState(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadUserData(userId: string) {
    const [profile, scans] = await Promise.all([
      fetchProfile(userId),
      fetchScans(userId),
    ]);
    if (profile) {
      setUserState(profileToUser(profile, userId));
    }
    setScanHistory(scans);
    setIsLoggedInState(true);
  }

  // ── Setters ───────────────────────────────────────────────────────────────
  const setUser = async (u: User) => {
    setUserState(u);
    if (u.id) {
      await updateProfile(u.id, {
        email: u.email,
        name: u.name,
        age: u.age,
        plan: u.plan,
        scans_today: u.scansToday,
        last_scan_date: u.lastScanDate,
      });
    }
  };

  const setIsOnboarded = async (v: boolean) => {
    setIsOnboardedState(v);
    await AsyncStorage.setItem("isOnboarded", v ? "true" : "false");
  };

  const setIsLoggedIn = async (v: boolean) => {
    setIsLoggedInState(v);
  };

  // ── Scans ─────────────────────────────────────────────────────────────────
  const addScan = async (scan: ScanResult) => {
    // Optimistic local update
    setScanHistory((prev) => [scan, ...prev].slice(0, 50));

    const today = new Date().toDateString();

    if (user) {
      // Persist to Supabase
      try {
        await saveScan(user.id, scan);
      } catch (e) {
        console.warn("Supabase saveScan failed, kept locally:", e);
      }

      // Update scan count
      const newUser: User = {
        ...user,
        scansToday: user.lastScanDate === today ? user.scansToday + 1 : 1,
        lastScanDate: today,
      };
      setUserState(newUser);
      try {
        await updateProfile(user.id, {
          scans_today: newUser.scansToday,
          last_scan_date: newUser.lastScanDate,
        });
      } catch (e) {
        console.warn("Profile update failed:", e);
      }
    }
  };

  const deleteScanById = async (id: string) => {
    setScanHistory((prev) => prev.filter((s) => s.id !== id));
    try {
      const { deleteScan } = await import("@/lib/scanService");
      await deleteScan(id);
    } catch (e) {
      console.warn("Delete scan failed:", e);
    }
  };

  const refreshScans = async () => {
    if (!user?.id) return;
    try {
      const scans = await fetchScans(user.id);
      setScanHistory(scans);
    } catch (e) {
      console.warn("Refresh scans failed:", e);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut();
    setUserState(null);
    setScanHistory([]);
    setIsLoggedInState(false);
  };

  // ── Scan gate ─────────────────────────────────────────────────────────────
  const dailyLimit = user?.plan === "plus" ? 5 : user?.plan === "pro" ? Infinity : 1;
  const canScanToday =
    !user ||
    user.plan === "pro" ||
    user.lastScanDate !== new Date().toDateString() ||
    user.scansToday < dailyLimit;

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isOnboarded,
        setIsOnboarded,
        isLoggedIn,
        setIsLoggedIn,
        scanHistory,
        addScan,
        deleteScanById,
        currentScan,
        setCurrentScan,
        canScanToday,
        logout,
        refreshScans,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
