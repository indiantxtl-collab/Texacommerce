import { useAuth } from "@/utils/auth/useAuth";
import { Stack } from "expo-router";
import * as ExpoSplash from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View } from "react-native";
import TxSplash from "./splash";

ExpoSplash.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Seed demo user once — silent, non-blocking
const seedDemoOnce = () => {
  fetch("/api/auth/seed-demo", { method: "POST" }).catch(() => {});
};

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const seeded = useRef(false);

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    if (isReady) {
      ExpoSplash.hideAsync();
      if (!seeded.current) {
        seeded.current = true;
        seedDemoOnce();
      }
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1 }}>
        <TxSplash onComplete={() => {}} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName="index"
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="search" />
            <Stack.Screen name="battles" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="settings/privacy" />
            <Stack.Screen name="settings/security" />
            <Stack.Screen name="settings/change-password" />
            <Stack.Screen name="settings/account-info" />
            <Stack.Screen name="settings/appearance" />
            <Stack.Screen name="settings/content" />
            <Stack.Screen name="settings/login-activity" />
            <Stack.Screen name="settings/blocked-users" />
            <Stack.Screen name="settings/muted-users" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="prestige-card" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="wishlist" />
            <Stack.Screen name="create-story" />
            <Stack.Screen name="create-reel" />
            <Stack.Screen name="create-room" />
            <Stack.Screen name="story/[userId]" />
            <Stack.Screen name="user/[username]" />
            <Stack.Screen name="chat/[userId]" />
            <Stack.Screen name="room/[roomId]" />
            <Stack.Screen name="reel/[id]/comments" />
            <Stack.Screen
              name="call/voice/[userId]"
              options={{ animation: "fade" }}
            />
            <Stack.Screen
              name="call/video/[userId]"
              options={{ animation: "fade" }}
            />
            <Stack.Screen name="store/browse" />
            <Stack.Screen name="store/create" />
            <Stack.Screen name="store/[storeId]" />
            <Stack.Screen name="store/product/[id]" />
          </Stack>
          {showSplash && <TxSplash onComplete={() => setShowSplash(false)} />}
        </View>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
