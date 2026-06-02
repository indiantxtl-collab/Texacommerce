import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { Image as ExpoImage } from "expo-image";
import { COLORS } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { data: authUser } = useUser();

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const {
    data: conversationsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["conversations", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { conversations: [] };
      const res = await fetch(`/api/messages?userId=${currentUserId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!currentUserId,
    refetchInterval: 4000,
  });

  const conversations = conversationsData?.conversations || [];
  const filtered = conversations.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      c.username?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: COLORS.text,
              flex: 1,
            }}
          >
            Messages
          </Text>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLORS.bgSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TxIcon name="edit" size={17} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: COLORS.bgSecondary,
            borderRadius: 12,
            paddingHorizontal: 12,
          }}
        >
          <TxIcon name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search messages..."
            placeholderTextColor={COLORS.textMuted}
            style={{
              flex: 1,
              color: COLORS.text,
              fontSize: 15,
              paddingVertical: 10,
              marginLeft: 8,
            }}
          />
        </View>
      </View>

      {/* Online bubbles */}
      {conversations.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            backgroundColor: COLORS.bg,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
            maxHeight: 88,
            flexGrow: 0,
          }}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 14,
          }}
        >
          {conversations.slice(0, 12).map((c) => (
            <TouchableOpacity
              key={c.user_id}
              onPress={() => router.push(`/chat/${c.user_id}`)}
              style={{ alignItems: "center" }}
            >
              <View style={{ position: "relative" }}>
                <ExpoImage
                  source={{
                    uri: c.profile_picture || "https://via.placeholder.com/48",
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: COLORS.brand + "50",
                  }}
                  contentFit="cover"
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: COLORS.success,
                    borderWidth: 2,
                    borderColor: COLORS.bg,
                  }}
                />
              </View>
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 10,
                  marginTop: 3,
                  maxWidth: 48,
                }}
                numberOfLines={1}
              >
                {c.username}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        style={{ flex: 1 }}
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
        {isLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator color={COLORS.brand} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: COLORS.brand + "10",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <TxIcon name="chat" size={34} color={COLORS.brand} />
            </View>
            <Text
              style={{
                color: COLORS.text,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              No Messages Yet
            </Text>
            <Text
              style={{
                color: COLORS.textSecondary,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Find people to chat with, make voice or video calls
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/search")}
              style={{
                marginTop: 20,
                backgroundColor: COLORS.brand,
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                Find People
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((conv) => (
            <TouchableOpacity
              key={conv.user_id}
              onPress={() => router.push(`/chat/${conv.user_id}`)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.borderLight,
              }}
            >
              <View style={{ position: "relative", marginRight: 12 }}>
                <ExpoImage
                  source={{
                    uri:
                      conv.profile_picture || "https://via.placeholder.com/54",
                  }}
                  style={{ width: 54, height: 54, borderRadius: 27 }}
                  contentFit="cover"
                />
                {conv.is_online && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 13,
                      height: 13,
                      borderRadius: 7,
                      backgroundColor: COLORS.success,
                      borderWidth: 2,
                      borderColor: COLORS.bg,
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: 15,
                      fontWeight: conv.unread_count ? "700" : "600",
                    }}
                  >
                    {conv.full_name}
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                    {formatTime(conv.last_message_time)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 2,
                  }}
                >
                  <Text
                    style={{
                      color: conv.unread_count ? COLORS.text : COLORS.textMuted,
                      fontSize: 13,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {conv.is_typing ? (
                      <Text
                        style={{ color: COLORS.brand, fontStyle: "italic" }}
                      >
                        typing...
                      </Text>
                    ) : (
                      conv.last_message || "Say hello!"
                    )}
                  </Text>
                  {conv.unread_count > 0 && (
                    <View
                      style={{
                        width: 19,
                        height: 19,
                        borderRadius: 10,
                        backgroundColor: COLORS.brand,
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: "700",
                        }}
                      >
                        {conv.unread_count > 9 ? "9+" : conv.unread_count}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 6, marginLeft: 10 }}>
                <TouchableOpacity
                  onPress={() => router.push(`/call/voice/${conv.user_id}`)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: COLORS.bgSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TxIcon name="phone" size={14} color={COLORS.brand} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/call/video/${conv.user_id}`)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: COLORS.bgSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TxIcon
                    name="video"
                    size={14}
                    color={COLORS.brandSecondary}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
