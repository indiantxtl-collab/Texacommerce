import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { Image as ExpoImage } from "expo-image";
import { COLORS, LOGO_URL, APP_NAME, SHADOW } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const { data: storiesData, refetch } = useQuery({
    queryKey: ["home-stories", currentUserId],
    queryFn: async () => {
      const url = currentUserId
        ? `/api/stories?userId=${currentUserId}`
        : "/api/stories";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const stories = storiesData?.stories || [];

  const QUICK_ACTIONS = [
    {
      icon: "store",
      label: "Shops",
      color: COLORS.brand,
      route: "/store/browse",
    },
    {
      icon: "bag",
      label: "Orders",
      color: COLORS.brandSecondary,
      route: "/orders",
    },
    {
      icon: "sparkle",
      label: "Create",
      color: COLORS.brandPink,
      route: "/create-reel",
    },
    {
      icon: "bell",
      label: "Alerts",
      color: COLORS.gold,
      route: "/notifications",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgSecondary }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: COLORS.bg,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ExpoImage
            source={{ uri: LOGO_URL }}
            style={{ width: 32, height: 32, borderRadius: 8 }}
            contentFit="contain"
          />
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: COLORS.brand,
              flex: 1,
              letterSpacing: 0.5,
            }}
          >
            {APP_NAME}
          </Text>
          {[
            { icon: "search", route: "/search" },
            { icon: "bell", route: "/notifications" },
            { icon: "cart", route: "/cart" },
          ].map(({ icon, route }) => (
            <TouchableOpacity
              key={icon}
              onPress={() => router.push(route)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: COLORS.bgSecondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TxIcon name={icon} size={17} color={COLORS.text} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.brand}
          />
        }
      >
        {/* Stories Row */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingVertical: 12, flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
          >
            <TouchableOpacity
              onPress={() => router.push("/create-story")}
              style={{ alignItems: "center", width: 64 }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: COLORS.bgSecondary,
                  borderWidth: 2,
                  borderColor: COLORS.brand,
                  borderStyle: "dashed",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TxIcon name="plus" size={22} color={COLORS.brand} />
              </View>
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 11,
                  marginTop: 5,
                }}
              >
                Add
              </Text>
            </TouchableOpacity>
            {stories.map((story) => (
              <TouchableOpacity
                key={story.id}
                onPress={() => router.push(`/story/${story.user_id}`)}
                style={{ alignItems: "center", width: 64 }}
              >
                <View
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                    padding: 2,
                    borderWidth: 2.5,
                    borderColor: COLORS.brand,
                  }}
                >
                  <ExpoImage
                    source={{
                      uri:
                        story.profile_picture ||
                        "https://via.placeholder.com/58",
                    }}
                    style={{ width: 54, height: 54, borderRadius: 27 }}
                    contentFit="cover"
                  />
                </View>
                <Text
                  style={{ color: COLORS.text, fontSize: 11, marginTop: 5 }}
                  numberOfLines={1}
                >
                  {story.username}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            margin: 12,
            borderRadius: 16,
            ...SHADOW.sm,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            {QUICK_ACTIONS.map(({ icon, label, color, route }, i) => (
              <TouchableOpacity
                key={label}
                onPress={() => router.push(route)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 16,
                  borderRightWidth: i < 3 ? 1 : 0,
                  borderRightColor: COLORS.border,
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: color + "18",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                  }}
                >
                  <TxIcon name={icon} size={20} color={color} />
                </View>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Battles */}
        <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                flex: 1,
              }}
            >
              <TxIcon name="zapFill" size={18} color={COLORS.brand} />
              <Text
                style={{ color: COLORS.text, fontSize: 17, fontWeight: "700" }}
              >
                Daily Battles
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/battles")}>
              <Text
                style={{ color: COLORS.brand, fontSize: 13, fontWeight: "600" }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/battles")}
            style={{
              backgroundColor: COLORS.bg,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1.5,
              borderColor: COLORS.brand + "40",
              ...SHADOW.sm,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: COLORS.brand + "15",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TxIcon name="zap" size={22} color={COLORS.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  Real-Time Choice Trading
                </Text>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  Vote and invest coins to win 2x rewards
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Open Store Banner */}
        <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => router.push("/store/create")}
            style={{
              backgroundColor: COLORS.brand + "10",
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: COLORS.brand + "30",
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: COLORS.brand + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TxIcon name="store" size={24} color={COLORS.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: COLORS.text, fontSize: 15, fontWeight: "700" }}
              >
                Open Your Store
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                Sell to millions · Free to start
              </Text>
            </View>
            <TxIcon name="chevronRight" size={18} color={COLORS.brand} />
          </TouchableOpacity>
        </View>

        {/* Live Rooms */}
        <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                flex: 1,
              }}
            >
              <TxIcon name="mic" size={18} color={COLORS.brandSecondary} />
              <Text
                style={{ color: COLORS.text, fontSize: 17, fontWeight: "700" }}
              >
                Live Rooms
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/voice")}>
              <Text
                style={{ color: COLORS.brand, fontSize: 13, fontWeight: "600" }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/voice")}
            style={{
              backgroundColor: COLORS.bg,
              borderRadius: 14,
              padding: 18,
              borderWidth: 1,
              borderColor: COLORS.border,
              ...SHADOW.sm,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: COLORS.brandSecondary + "15",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TxIcon name="mic" size={20} color={COLORS.brandSecondary} />
            </View>
            <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
              Tap to join live voice rooms
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
