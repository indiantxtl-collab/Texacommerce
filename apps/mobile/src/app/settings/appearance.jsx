import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { COLORS } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "ko", label: "Korean", native: "한국어" },
];

export default function AppearanceSettingsScreen() {
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
    onSuccess: (data) =>
      queryClient.setQueryData(["settings", currentUserId], (old) => ({
        ...old,
        settings: data.settings,
      })),
    onError: () =>
      Alert.alert("Error", "Could not save setting. Please try again."),
  });

  const settings = data?.settings || {};

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
            Appearance & Language
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
          Theme
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
            label="Light"
            desc="White and clean"
            selected={settings.theme === "light" || !settings.theme}
            onSelect={() => updateMutation.mutate({ theme: "light" })}
          />
          <OptionRow
            label="Dark"
            desc="Dark and immersive"
            selected={settings.theme === "dark"}
            onSelect={() => {
              updateMutation.mutate({ theme: "dark" });
              Alert.alert("Note", "Dark mode support coming soon!");
            }}
          />
          <OptionRow
            label="System Default"
            desc="Follows your device setting"
            selected={settings.theme === "system"}
            onSelect={() => updateMutation.mutate({ theme: "system" })}
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
          Language
        </Text>
        <View
          style={{
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 8,
          }}
        >
          {LANGUAGES.map((lang, idx) => (
            <OptionRow
              key={lang.code}
              label={lang.native}
              desc={lang.label}
              selected={
                settings.language === lang.code ||
                (!settings.language && lang.code === "en")
              }
              onSelect={() => updateMutation.mutate({ language: lang.code })}
              last={idx === LANGUAGES.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
