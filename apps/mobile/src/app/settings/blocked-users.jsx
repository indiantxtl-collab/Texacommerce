import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import useUser from "@/utils/auth/useUser";
import { COLORS } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function BlockedUsersScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const [currentUserId, setCurrentUserId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const { data, isLoading } = useQuery({
    queryKey: ["blocked-users", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { users: [] };
      const res = await fetch(
        `/api/settings/blocked-users?userId=${currentUserId}`,
      );
      if (!res.ok) return { users: [] };
      return res.json();
    },
    enabled: !!currentUserId,
  });

  const unblockMutation = useMutation({
    mutationFn: async (blockedId) => {
      const res = await fetch("/api/settings/blocked-users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockerId: currentUserId, blockedId }),
      });
      if (!res.ok) throw new Error("Failed to unblock");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["blocked-users"]),
    onError: () => Alert.alert("Error", "Could not unblock user."),
  });

  const users = data?.users || [];

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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <TxIcon name="back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.text }}>
            Blocked Users
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {isLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator color={COLORS.brand} />
          </View>
        ) : users.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <TxIcon
              name="users"
              size={48}
              color={COLORS.textMuted}
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{ color: COLORS.text, fontSize: 18, fontWeight: "700" }}
            >
              No blocked users
            </Text>
            <Text
              style={{
                color: COLORS.textSecondary,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Users you block won't be able to find your profile or contact you
            </Text>
          </View>
        ) : (
          <View
            style={{
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: COLORS.border,
              backgroundColor: COLORS.bg,
            }}
          >
            {users.map((user, idx) => (
              <View
                key={user.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  borderBottomWidth: idx < users.length - 1 ? 1 : 0,
                  borderBottomColor: COLORS.borderLight,
                }}
              >
                <ExpoImage
                  source={{
                    uri:
                      user.profile_picture || "https://via.placeholder.com/46",
                  }}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    marginRight: 13,
                  }}
                  contentFit="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {user.full_name}
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                    @{user.username}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Unblock", `Unblock @${user.username}?`, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Unblock",
                        onPress: () => unblockMutation.mutate(user.id),
                      },
                    ])
                  }
                  style={{
                    backgroundColor: COLORS.bgSecondary,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    Unblock
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
