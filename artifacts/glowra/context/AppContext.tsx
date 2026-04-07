import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  name: string;
  age: number;
  isPro: boolean;
  scansToday: number;
  lastScanDate: string;
};

type AppContextType = {
  user: User | null;
  setUser: (u: User) => void;
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  scanHistory: ScanResult[];
  addScan: (scan: ScanResult) => void;
  currentScan: ScanResult | null;
  setCurrentScan: (scan: ScanResult | null) => void;
  canScanToday: boolean;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [isLoggedIn, setIsLoggedInState] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [onb, login, userData, history] = await Promise.all([
          AsyncStorage.getItem("isOnboarded"),
          AsyncStorage.getItem("isLoggedIn"),
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("scanHistory"),
        ]);
        if (onb === "true") setIsOnboardedState(true);
        if (login === "true") setIsLoggedInState(true);
        if (userData) setUserState(JSON.parse(userData));
        if (history) setScanHistory(JSON.parse(history));
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setUser = async (u: User) => {
    setUserState(u);
    await AsyncStorage.setItem("user", JSON.stringify(u));
  };

  const setIsOnboarded = async (v: boolean) => {
    setIsOnboardedState(v);
    await AsyncStorage.setItem("isOnboarded", v ? "true" : "false");
  };

  const setIsLoggedIn = async (v: boolean) => {
    setIsLoggedInState(v);
    await AsyncStorage.setItem("isLoggedIn", v ? "true" : "false");
  };

  const addScan = async (scan: ScanResult) => {
    const updated = [scan, ...scanHistory].slice(0, 50);
    setScanHistory(updated);
    await AsyncStorage.setItem("scanHistory", JSON.stringify(updated));

    if (user) {
      const today = new Date().toDateString();
      const newUser: User = {
        ...user,
        scansToday: user.lastScanDate === today ? user.scansToday + 1 : 1,
        lastScanDate: today,
      };
      setUser(newUser);
    }
  };

  const canScanToday =
    !user ||
    user.isPro ||
    user.lastScanDate !== new Date().toDateString() ||
    user.scansToday < 1;

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
        currentScan,
        setCurrentScan,
        canScanToday,
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
