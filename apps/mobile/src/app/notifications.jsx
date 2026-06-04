import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import useUser from "@/utils/auth/useUser";
import { COLORS } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

const NOTIF_CONFIGS = {
  like: { bg: "#FFF0EB", iconName: "heartFill", color: "#FF6B35" },
  comment: { bg: "#F0EEFF", iconName: "comment", color: "#9B2FAD" },
  follow: { bg: "#E8F8EE", iconName: "userPlus", color: "#34C759" },
  follow_request: { bg: "#F0EEFF", iconName: "users", color: "#9B2FAD" },
  mention: { bg: "#FFF5E0", iconName: "sparkle", color: "#F5A623" },
  message: { bg: "#E5F0FF", iconName: "chat", color: "#007AFF" },
  order: { bg: "#E8F8EE", iconName: "package", color: "#34C759" },
  review: { bg: "#FFF5E0", iconName: "star", color: "#F5A623" },
  system: { bg: "#F5F5F7", iconName: "info", color: "#555" },
};

const getDestination = (notif) => {
  switch (notif.type) {
    case "follow":
    case "follow_request":
      return notif.actor_username ? `/user/${notif.actor_username}` : null;
    case "message":
      return notif.actor_id ? `/chat/${notif.actor_id}` : "/(tabs)/messages";
    case "order":
      return "/orders";
    default:
      return null;
  }
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const groupByDate = (notifications) => {
  return notifications.reduce((acc, n) => {
    const d = new Date(n.created_at);
    const today = new Date();
    const yesterday = new Date(today - 86400000);
    let group =
      d.toDateString() === today.toDateString()
        ? "Today"
        : d.toDateString() === yesterday.toDateString()
          ? "Yesterday"
          : d.toLocaleDateString([], {
              weekday: "long",
              month: "short",
              day: "numeric",
            });
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { notifications: [], unreadCount: 0 };
      const res = await fetch(
        `/api/notifications?userId=${currentUserId}&limit=50`,
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!currentUserId,
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, notificationId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, markAllRead: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const handlePress = (notif) => {
    if (!notif.is_read) markReadMutation.mutate(notif.id);
    const dest = getDestination(notif);
    if (dest) router.push(dest);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const grouped = groupByDate(notifications);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgSecondary }}>
      <StatusBar style="dark" />

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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 14 }}
          >
            <TxIcon name="back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: COLORS.text,
              flex: 1,
            }}
          >
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  backgroundColor: COLORS.brand,
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}
                >
                  {unreadCount} new
                </Text>
              </View>
              <TouchableOpacity onPress={() => markAllReadMutation.mutate()}>
                <Text
                  style={{
                    color: COLORS.brand,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  Mark all read
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={COLORS.brand} size="large" />
        </View>
      ) : notifications.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              backgroundColor: COLORS.brand + "10",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <TxIcon name="bell" size={34} color={COLORS.brand} />
          </View>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            All caught up!
          </Text>
          <Text
            style={{
              color: COLORS.textSecondary,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            When someone likes your posts, follows you, or sends a message,
            you'll see it here.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.brand}
            />
          }
        >
          {Object.entries(grouped).map(([group, items]) => (
            <View key={group}>
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  backgroundColor: COLORS.bgSecondary,
                }}
              >
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 11,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {group}
                </Text>
              </View>
              {items.map((notif) => {
                const cfg = NOTIF_CONFIGS[notif.type] || NOTIF_CONFIGS.system;
                return (
                  <TouchableOpacity
                    key={notif.id}
                    onPress={() => handlePress(notif)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 13,
                      backgroundColor: notif.is_read
                        ? COLORS.bg
                        : COLORS.brand + "04",
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.borderLight,
                    }}
                  >
                    <View style={{ position: "relative", marginRight: 13 }}>
                      {notif.actor_avatar ? (
                        <ExpoImage
                          source={{ uri: notif.actor_avatar }}
                          style={{ width: 48, height: 48, borderRadius: 24 }}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: cfg.bg,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <TxIcon
                            name={cfg.iconName}
                            size={22}
                            color={cfg.color}
                          />
                        </View>
                      )}
                      <View
                        style={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: cfg.bg,
                          borderWidth: 2,
                          borderColor: COLORS.bg,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <TxIcon
                          name={cfg.iconName}
                          size={10}
                          color={cfg.color}
                        />
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      {notif.actor_name && (
                        <Text
                          style={{
                            color: COLORS.text,
                            fontSize: 14,
                            fontWeight: "700",
                          }}
                          numberOfLines={1}
                        >
                          {notif.actor_name}
                        </Text>
                      )}
                      <Text
                        style={{
                          color: COLORS.textSecondary,
                          fontSize: 13,
                          marginTop: notif.actor_name ? 1 : 0,
                        }}
                        numberOfLines={2}
                      >
                        {notif.body || notif.title}
                      </Text>
                      <Text
                        style={{
                          color: COLORS.textMuted,
                          fontSize: 11,
                          marginTop: 3,
                        }}
                      >
                        {formatTime(notif.created_at)}
                      </Text>
                    </View>
                    {!notif.is_read && (
                      <View
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 4,
                          backgroundColor: COLORS.brand,
                          marginLeft: 10,
                        }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
