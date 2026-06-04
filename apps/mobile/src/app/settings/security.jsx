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

export default function SecuritySettingsScreen() {
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

  const Row = ({
    icon,
    iconColor = COLORS.brand,
    label,
    desc,
    onPress,
    toggle,
    toggleValue,
    onToggle,
    last,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.bg,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: COLORS.borderLight,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          backgroundColor: iconColor + "14",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <TxIcon name={icon} size={17} color={iconColor} />
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
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.brand + "60" }}
          thumbColor={toggleValue ? COLORS.brand : "#fff"}
        />
      ) : onPress ? (
        <TxIcon name="chevronRight" size={17} color={COLORS.textMuted} />
      ) : null}
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
            Security
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
          Authentication
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
            icon="shield"
            iconColor={COLORS.success}
            label="Two-Factor Authentication"
            desc={settings.two_factor_enabled ? "Enabled" : "Not enabled"}
            toggle
            toggleValue={!!settings.two_factor_enabled}
            onToggle={() =>
              updateMutation.mutate({
                two_factor_enabled: !settings.two_factor_enabled,
              })
            }
          />
          <Row
            icon="bell"
            iconColor={COLORS.warning}
            label="Login Alerts"
            desc="Get notified of new sign-ins"
            toggle
            toggleValue={settings.login_alerts !== false}
            onToggle={() =>
              updateMutation.mutate({ login_alerts: !settings.login_alerts })
            }
          />
          <Row
            icon="lock"
            iconColor={COLORS.brandSecondary}
            label="Change Password"
            onPress={() => router.push("/settings/change-password")}
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
          Sessions
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
            icon="eye"
            iconColor={COLORS.info}
            label="Login Activity"
            desc="View all recent sign-ins"
            onPress={() => router.push("/settings/login-activity")}
            last
          />
        </View>
        <View
          style={{
            backgroundColor: COLORS.bg,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: COLORS.border,
            padding: 16,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
          >
            <TxIcon name="shield" size={18} color={COLORS.success} />
            <Text
              style={{
                flex: 1,
                color: COLORS.textSecondary,
                fontSize: 13,
                lineHeight: 20,
              }}
            >
              Two-factor authentication adds an extra layer of security. When
              enabled, you'll need to verify your identity on new devices.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
