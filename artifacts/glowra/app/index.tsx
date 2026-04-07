import { Redirect } from "expo-router";
import { useApp } from "@/context/AppContext";

export default function Index() {
  const { isOnboarded, isLoggedIn } = useApp();

  if (!isOnboarded) return <Redirect href="/onboarding" />;
  if (!isLoggedIn) return <Redirect href="/auth" />;
  return <Redirect href="/(tabs)" />;
}
