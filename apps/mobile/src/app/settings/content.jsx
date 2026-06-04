import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { COLORS } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

const OptionRow = ({ label, desc, selected, onSelect, last }) => (
  <TouchableOpacity
    onPress={onSelect}
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 13,
      backgroundColor: COLORS.bg,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: COLORS.borderLight,
    }}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ color: COLORS.text, fontSize: 14.5, fontWeight: "500" }}>
        {label}
      </Text>
      {desc && (
        <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 1 }}>
          {desc}
        </Text>
      )}
    </View>
    {selected && <TxIcon name="check" size={20} color={COLORS.brand} />}
  </TouchableOpacity>
);

export default function ContentSettingsScreen() {
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
    onSuccess: (d) =>
      queryClient.setQueryData(["settings", currentUserId], (old) => ({
        ...old,
        settings: d.settings,
      })),
    onError: () => Alert.alert("Error", "Could not save setting."),
  });

  const settings = data?.settings || {};

  const Row = ({
    icon,
    iconColor = COLORS.brand,
    label,
    desc,
    toggle,
    toggleValue,
    onToggle,
    last,
  }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 13,
        backgroundColor: COLORS.bg,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: COLORS.borderLight,
      }}
    >
      <View
        style={{
          width: 33,
          height: 33,
          borderRadius: 8,
          backgroundColor: iconColor + "14",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 13,
        }}
      >
        <TxIcon name={icon} size={16} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: COLORS.text, fontSize: 14.5, fontWeight: "500" }}>
          {label}
        </Text>
        {desc && (
          <Text
            style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 1.5 }}
          >
            {desc}
          </Text>
        )}
      </View>
      {toggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.brand + "60" }}
          thumbColor={toggleValue ? COLORS.brand : "#fff"}
        />
      )}
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
            Content Preferences
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 40,
        }}
      >
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
          Videos
        </Text>
        <View
          style={{
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 8,
          }}
        >
          <Row
            icon="play"
            label="Autoplay Videos"
            desc="Play videos automatically while scrolling"
            toggle
            toggleValue={settings.autoplay_videos !== false}
            onToggle={() =>
              updateMutation.mutate({
                autoplay_videos: !settings.autoplay_videos,
              })
            }
          />
          <Row
            icon="volumeOff"
            iconColor={COLORS.textMuted}
            label="Mute Reels by Default"
            desc="Start reels without sound"
            toggle
            toggleValue={!!settings.mute_reels_by_default}
            onToggle={() =>
              updateMutation.mutate({
                mute_reels_by_default: !settings.mute_reels_by_default,
              })
            }
            last
          />
        </View>

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
          Feed Preferences
        </Text>
        <View
          style={{
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 8,
          }}
        >
          <OptionRow
            label="For You"
            desc="Algorithm-curated personalised feed"
            selected={
              settings.feed_preferences === "for_you" ||
              !settings.feed_preferences
            }
            onSelect={() =>
              updateMutation.mutate({ feed_preferences: "for_you" })
            }
          />
          <OptionRow
            label="Following Only"
            desc="Posts from people you follow"
            selected={settings.feed_preferences === "following"}
            onSelect={() =>
              updateMutation.mutate({ feed_preferences: "following" })
            }
            last
          />
        </View>

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
          Story Settings
        </Text>
        <View
          style={{
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 8,
          }}
        >
          <OptionRow
            label="Everyone"
            desc="All users can see your stories"
            selected={
              settings.story_settings === "everyone" || !settings.story_settings
            }
            onSelect={() =>
              updateMutation.mutate({ story_settings: "everyone" })
            }
          />
          <OptionRow
            label="Followers Only"
            desc="Only your followers can see stories"
            selected={settings.story_settings === "followers"}
            onSelect={() =>
              updateMutation.mutate({ story_settings: "followers" })
            }
            last
          />
        </View>
      </ScrollView>
    </View>
  );
}
