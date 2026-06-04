import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { COLORS, SHADOW } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

const OptionRow = ({ label, desc, selected, onSelect }) => (
  <TouchableOpacity
    onPress={onSelect}
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderLight,
      backgroundColor: COLORS.bg,
    }}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: "500" }}>
        {label}
      </Text>
      {desc && (
        <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
          {desc}
        </Text>
      )}
    </View>
    {selected && <TxIcon name="check" size={20} color={COLORS.brand} />}
  </TouchableOpacity>
);

export default function PrivacySettingsScreen() {
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

  const { data } = useQuery({
    queryKey: ["settings", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { settings: {} };
      const res = await fetch(`/api/settings?userId=${currentUserId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!currentUserId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, ...updates }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", currentUserId], (old) => ({
        ...old,
        settings: data.settings,
      }));
    },
    onError: () =>
      Alert.alert("Error", "Could not save setting. Please try again."),
  });

  const settings = data?.settings || {};

  const Section = ({ title, children }) => (
    <View style={{ marginBottom: 8 }}>
      <Text
        style={{
          color: COLORS.textSecondary,
          fontSize: 11,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        {children}
      </View>
    </View>
  );

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
            Privacy Settings
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Profile Visibility">
          <OptionRow
            label="Everyone"
            desc="Anyone can see your profile"
            selected={
              settings.profile_visibility === "everyone" ||
              !settings.profile_visibility
            }
            onSelect={() =>
              updateMutation.mutate({ profile_visibility: "everyone" })
            }
          />
          <OptionRow
            label="Followers Only"
            desc="Only your followers can see your profile"
            selected={settings.profile_visibility === "followers"}
            onSelect={() =>
              updateMutation.mutate({ profile_visibility: "followers" })
            }
          />
        </Section>

        <Section title="Message Permissions">
          <OptionRow
            label="Everyone"
            desc="Anyone can send you a message"
            selected={
              settings.message_permissions === "everyone" ||
              !settings.message_permissions
            }
            onSelect={() =>
              updateMutation.mutate({ message_permissions: "everyone" })
            }
          />
          <OptionRow
            label="Followers Only"
            desc="Only followers can message you"
            selected={settings.message_permissions === "followers"}
            onSelect={() =>
              updateMutation.mutate({ message_permissions: "followers" })
            }
          />
          <OptionRow
            label="Nobody"
            desc="Disable all direct messages"
            selected={settings.message_permissions === "nobody"}
            onSelect={() =>
              updateMutation.mutate({ message_permissions: "nobody" })
            }
          />
        </Section>

        <Section title="Story Visibility">
          <OptionRow
            label="Everyone"
            selected={
              settings.story_settings === "everyone" || !settings.story_settings
            }
            onSelect={() =>
              updateMutation.mutate({ story_settings: "everyone" })
            }
          />
          <OptionRow
            label="Followers Only"
            selected={settings.story_settings === "followers"}
            onSelect={() =>
              updateMutation.mutate({ story_settings: "followers" })
            }
          />
          <OptionRow
            label="Close Friends"
            selected={settings.story_settings === "close_friends"}
            onSelect={() =>
              updateMutation.mutate({ story_settings: "close_friends" })
            }
          />
        </Section>

        <View
          style={{
            backgroundColor: COLORS.bg,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: COLORS.border,
            padding: 16,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            These settings control who can interact with you on {"\n"}Texa.
            Changes are applied immediately and synced across all your devices.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
