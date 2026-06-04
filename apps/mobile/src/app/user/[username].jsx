import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { Image as ExpoImage } from "expo-image";
import { COLORS, SHADOW } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

const getLevelName = (level) => {
  if (level >= 30) return "Diamond";
  if (level >= 20) return "Platinum";
  if (level >= 15) return "Gold";
  if (level >= 10) return "Silver";
  return "Bronze";
};

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { username } = useLocalSearchParams();
  const { data: authUser } = useUser();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = React.useState(null);

  React.useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${username}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: followData } = useQuery({
    queryKey: ["is-following", username, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { isFollowing: false };
      const res = await fetch(
        `/api/profile/${username}/is-following?currentUserId=${currentUserId}`,
      );
      if (!res.ok) return { isFollowing: false };
      return res.json();
    },
    enabled: !!currentUserId,
  });

  const { data: storeData } = useQuery({
    queryKey: ["user-store", profileData?.user?.id],
    queryFn: async () => {
      const res = await fetch(
        `/api/store/my-store?userId=${profileData?.user?.id}`,
      );
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!profileData?.user?.id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/profile/${username}/follow`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentUserId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["is-following"]);
      queryClient.invalidateQueries(["profile"]);
    },
  });

  const user = profileData?.user;
  const isFollowing = followData?.isFollowing || user?.isFollowing || false;
  const userStore = storeData?.store;

  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar style="dark" />
        <ActivityIndicator color={COLORS.brand} />
      </View>
    );

  if (!user)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar style="dark" />
        <Text style={{ color: COLORS.textMuted }}>User not found</Text>
      </View>
    );

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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <TxIcon name="back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 18,
              fontWeight: "700",
              flex: 1,
            }}
          >
            @{user.username}
          </Text>
          <TouchableOpacity
            onPress={() =>
              Share.share({ message: `Check out @${user.username} on Texa!` })
            }
          >
            <TxIcon name="share" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Profile Card */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingTop: 20,
              gap: 16,
            }}
          >
            {/* Avatar */}
            <View style={{ position: "relative" }}>
              <ExpoImage
                source={{
                  uri: user.profile_picture || "https://via.placeholder.com/88",
                }}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  borderWidth: 3,
                  borderColor: user.verified ? COLORS.brand : COLORS.border,
                }}
                contentFit="cover"
              />
              {user.verified && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: COLORS.brand,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: COLORS.bg,
                  }}
                >
                  <TxIcon name="check" size={12} color="#fff" />
                </View>
              )}
            </View>

            {/* Stats */}
            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: "row", justifyContent: "space-around" }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    0
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                    Posts
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: COLORS.border }} />
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    {user.followers_count || 0}
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                    Followers
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: COLORS.border }} />
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    {user.following_count || 0}
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                    Following
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <Text
              style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}
            >
              {user.full_name}
            </Text>
            {user.bio && (
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 13,
                  marginTop: 3,
                  lineHeight: 19,
                }}
              >
                {user.bio}
              </Text>
            )}

            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <View
                style={{
                  backgroundColor: COLORS.brand + "15",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{
                    color: COLORS.brand,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {getLevelName(user.level)} · Lv.{user.level}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: COLORS.gold + "15",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{
                    color: COLORS.gold,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  <TxIcon name="coin" size={13} color={COLORS.gold} />{" "}
                  {user.coins}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => followMutation.mutate()}
                disabled={!currentUserId}
                style={{
                  flex: 1.5,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: isFollowing
                    ? COLORS.bgSecondary
                    : COLORS.brand,
                  borderWidth: isFollowing ? 1 : 0,
                  borderColor: COLORS.border,
                }}
              >
                <Text
                  style={{
                    color: isFollowing ? COLORS.text : "#fff",
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(`/chat/${user.id}`)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: COLORS.bgSecondary,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <TxIcon name="chat" size={15} color={COLORS.text} />
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Message
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(`/call/voice/${user.id}`)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: COLORS.bgSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <TxIcon name="phone" size={16} color={COLORS.brand} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(`/call/video/${user.id}`)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: COLORS.bgSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <TxIcon name="video" size={16} color={COLORS.brandSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Store */}
        {userStore && (
          <View
            style={{
              backgroundColor: COLORS.bg,
              marginBottom: 8,
              padding: 14,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push(`/store/${userStore.id}`)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.brand + "08",
                borderRadius: 14,
                padding: 12,
                borderWidth: 1,
                borderColor: COLORS.brand + "30",
              }}
            >
              <TxIcon name="store" size={20} color={COLORS.brand} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  {userStore.name}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                  {userStore.category}
                </Text>
              </View>
              <Text style={{ color: COLORS.brand, fontSize: 13 }}>Visit →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content Placeholder */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            marginTop: 8,
            padding: 40,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: COLORS.bgSecondary,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <TxIcon name="camera" size={28} color={COLORS.textMuted} />
          </View>
          <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}>
            No Posts Yet
          </Text>
          <Text
            style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 4 }}
          >
            {user.full_name}'s posts will appear here
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
