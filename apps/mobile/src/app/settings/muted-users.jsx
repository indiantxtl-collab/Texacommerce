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

export default function MutedUsersScreen() {
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
    queryKey: ["muted-users", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { users: [] };
      const res = await fetch(
        `/api/settings/muted-users?userId=${currentUserId}`,
      );
      if (!res.ok) return { users: [] };
      return res.json();
    },
    enabled: !!currentUserId,
  });

  const unmuteMutation = useMutation({
    mutationFn: async (mutedId) => {
      const res = await fetch("/api/settings/muted-users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ muterId: currentUserId, mutedId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["muted-users"]),
    onError: () => Alert.alert("Error", "Could not unmute user."),
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
            Muted Users
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
              name="volumeOff"
              size={48}
              color={COLORS.textMuted}
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{ color: COLORS.text, fontSize: 18, fontWeight: "700" }}
            >
              No muted users
            </Text>
            <Text
              style={{
                color: COLORS.textSecondary,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Muted users' posts won't appear in your feed
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
                  onPress={() => unmuteMutation.mutate(user.id)}
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
                    Unmute
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
