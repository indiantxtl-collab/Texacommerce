import { Redirect } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { View, ActivityIndicator } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { COLORS, LOGO_URL, APP_NAME } from "@/constants/theme";
import { Text } from "react-native";

export default function Index() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.bg,
        }}
      >
        <ExpoImage
          source={{ uri: LOGO_URL }}
          style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 16 }}
          contentFit="contain"
        />
        <Text
          style={{
            fontSize: 32,
            fontWeight: "900",
            color: COLORS.brand,
            letterSpacing: 3,
            marginBottom: 24,
          }}
        >
          {APP_NAME}
        </Text>
        <ActivityIndicator size="large" color={COLORS.brand} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
