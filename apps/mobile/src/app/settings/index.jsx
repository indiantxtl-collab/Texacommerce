import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";
import { Image as ExpoImage } from "expo-image";
import { COLORS, SHADOW, LOGO_URL, APP_NAME } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const { signOut } = useAuth();
  const [currentUserId, setCurrentUserId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const { data: settingsData } = useQuery({
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
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["settings"]),
    onError: () =>
      Alert.alert("Error", "Failed to save setting. Please try again."),
  });

  const settings = settingsData?.settings || {};

  const toggle = (key) => {
    const newValue = !settings[key];
    updateMutation.mutate({ [key]: newValue });
    // Optimistically update cache
    queryClient.setQueryData(["settings", currentUserId], (old) => ({
      ...old,
      settings: { ...old?.settings, [key]: newValue },
    }));
  };

  const handleSignOut = () =>
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () =>
          signOut({ callbackUrl: "/account/signin", redirect: true }),
      },
    ]);

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
          backgroundColor: COLORS.bg,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        {children}
      </View>
    </View>
  );

  const Row = ({
    icon,
    iconColor = COLORS.brand,
    label,
    desc,
    onPress,
    toggle: hasToggle,
    toggleValue,
    onToggle,
    value,
    last,
    danger,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: COLORS.borderLight,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          backgroundColor: danger ? COLORS.errorLight : iconColor + "14",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <TxIcon
          name={icon}
          size={17}
          color={danger ? COLORS.error : iconColor}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: danger ? COLORS.error : COLORS.text,
            fontSize: 14.5,
            fontWeight: "500",
          }}
        >
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
      {hasToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.brand + "60" }}
          thumbColor={toggleValue ? COLORS.brand : "#fff"}
        />
      ) : value ? (
        <Text style={{ color: COLORS.textMuted, fontSize: 13, marginRight: 4 }}>
          {value}
        </Text>
      ) : onPress ? (
        <TxIcon name="chevronRight" size={17} color={COLORS.textMuted} />
      ) : null}
    </TouchableOpacity>
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
            style={{ marginRight: 14 }}
          >
            <TxIcon name="back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.text }}>
            Settings
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
        {/* Branding */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 0,
            padding: 20,
            alignItems: "center",
            marginBottom: 8,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <ExpoImage
            source={{ uri: LOGO_URL }}
            style={{ width: 52, height: 52, borderRadius: 13, marginBottom: 8 }}
            contentFit="contain"
          />
          <Text
            style={{ color: COLORS.brand, fontSize: 20, fontWeight: "900" }}
          >
            {APP_NAME}
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
            Version 1.0.0
          </Text>
        </View>

        {/* Account */}
        <Section title="Account">
          <Row
            icon="user"
            label="Edit Profile"
            desc="Update name, bio, photo"
            onPress={() => router.push("/edit-profile")}
          />
          <Row
            icon="lock"
            label="Change Password"
            desc="Update your password"
            onPress={() => router.push("/settings/change-password")}
          />
          <Row
            icon="info"
            label="Account Information"
            desc="Email, username, member since"
            onPress={() => router.push("/settings/account-info")}
            last
          />
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <Row
            icon="lock"
            iconColor={COLORS.brandSecondary}
            label="Account Privacy"
            desc={
              settings.account_private ? "Private account" : "Public account"
            }
            toggle
            toggleValue={!!settings.account_private}
            onToggle={() => toggle("account_private")}
          />
          <Row
            icon="eye"
            iconColor={COLORS.brandSecondary}
            label="Profile Visibility"
            desc="Who can see your profile"
            value={
              settings.profile_visibility === "everyone"
                ? "Everyone"
                : "Followers"
            }
            onPress={() => router.push("/settings/privacy")}
          />
          <Row
            icon="users"
            iconColor={COLORS.brandSecondary}
            label="Follow Requests"
            desc={
              settings.follow_requests_manual
                ? "Manual approval"
                : "Auto-approve"
            }
            toggle
            toggleValue={!!settings.follow_requests_manual}
            onToggle={() => toggle("follow_requests_manual")}
          />
          <Row
            icon="chat"
            iconColor={COLORS.brandSecondary}
            label="Message Permissions"
            desc="Who can send you messages"
            value={
              settings.message_permissions === "everyone"
                ? "Everyone"
                : "Followers"
            }
            onPress={() => router.push("/settings/privacy")}
          />
          <Row
            icon="check"
            iconColor={COLORS.brandSecondary}
            label="Read Receipts"
            desc="Let others see when you've read messages"
            toggle
            toggleValue={settings.show_read_receipts !== false}
            onToggle={() => toggle("show_read_receipts")}
          />
          <Row
            icon="globe"
            iconColor={COLORS.brandSecondary}
            label="Online Status"
            desc="Show when you're active"
            toggle
            toggleValue={settings.show_online_status !== false}
            onToggle={() => toggle("show_online_status")}
            last
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Row
            icon="bell"
            label="Push Notifications"
            toggle
            toggleValue={settings.push_notifications !== false}
            onToggle={() => toggle("push_notifications")}
          />
          <Row
            icon="user"
            label="Email Notifications"
            toggle
            toggleValue={settings.email_notifications !== false}
            onToggle={() => toggle("email_notifications")}
          />
          <Row
            icon="heartFill"
            iconColor={COLORS.brandPink}
            label="Likes"
            toggle
            toggleValue={settings.like_notifications !== false}
            onToggle={() => toggle("like_notifications")}
          />
          <Row
            icon="comment"
            iconColor={COLORS.brandSecondary}
            label="Comments"
            toggle
            toggleValue={settings.comment_notifications !== false}
            onToggle={() => toggle("comment_notifications")}
          />
          <Row
            icon="userPlus"
            iconColor={COLORS.success}
            label="Follows"
            toggle
            toggleValue={settings.follow_notifications !== false}
            onToggle={() => toggle("follow_notifications")}
          />
          <Row
            icon="sparkle"
            iconColor={COLORS.gold}
            label="Mentions"
            toggle
            toggleValue={settings.mention_notifications !== false}
            onToggle={() => toggle("mention_notifications")}
          />
          <Row
            icon="chat"
            iconColor={COLORS.info}
            label="Messages"
            toggle
            toggleValue={settings.message_notifications !== false}
            onToggle={() => toggle("message_notifications")}
          />
          <Row
            icon="package"
            iconColor={COLORS.success}
            label="Orders"
            toggle
            toggleValue={settings.order_notifications !== false}
            onToggle={() => toggle("order_notifications")}
          />
          <Row
            icon="bell"
            iconColor={COLORS.textMuted}
            label="Marketing Emails"
            toggle
            toggleValue={!!settings.marketing_emails}
            onToggle={() => toggle("marketing_emails")}
            last
          />
        </Section>

        {/* Content */}
        <Section title="Content & Feed">
          <Row
            icon="play"
            label="Autoplay Videos"
            toggle
            toggleValue={settings.autoplay_videos !== false}
            onToggle={() => toggle("autoplay_videos")}
          />
          <Row
            icon="volumeOff"
            label="Mute Reels by Default"
            toggle
            toggleValue={!!settings.mute_reels_by_default}
            onToggle={() => toggle("mute_reels_by_default")}
          />
          <Row
            icon="user"
            label="Story Settings"
            desc="Who can see your stories"
            value={
              settings.story_settings === "everyone" ? "Everyone" : "Followers"
            }
            onPress={() => router.push("/settings/content")}
          />
          <Row
            icon="home"
            label="Feed Preferences"
            desc="Personalise your home feed"
            value={
              settings.feed_preferences === "for_you" ? "For You" : "Following"
            }
            onPress={() => router.push("/settings/content")}
            last
          />
        </Section>

        {/* Appearance */}
        <Section title="Appearance & Language">
          <Row
            icon="sun"
            iconColor={COLORS.gold}
            label="Theme"
            desc="App appearance"
            value="Light"
            onPress={() => router.push("/settings/appearance")}
          />
          <Row
            icon="language"
            iconColor={COLORS.info}
            label="Language"
            desc="App language"
            value="English"
            onPress={() => router.push("/settings/appearance")}
            last
          />
        </Section>

        {/* Security */}
        <Section title="Security">
          <Row
            icon="shield"
            iconColor={COLORS.success}
            label="Security Settings"
            desc="Two-factor, login alerts"
            onPress={() => router.push("/settings/security")}
          />
          <Row
            icon="eye"
            iconColor={COLORS.info}
            label="Login Activity"
            desc="View recent sign-ins"
            onPress={() => router.push("/settings/login-activity")}
          />
          <Row
            icon="lock"
            iconColor={COLORS.warning}
            label="Two-Factor Auth"
            toggle
            toggleValue={!!settings.two_factor_enabled}
            onToggle={() => toggle("two_factor_enabled")}
            last
          />
        </Section>

        {/* Social */}
        <Section title="Social">
          <Row
            icon="users"
            iconColor={COLORS.error}
            label="Blocked Users"
            onPress={() => router.push("/settings/blocked-users")}
          />
          <Row
            icon="volumeOff"
            iconColor={COLORS.textMuted}
            label="Muted Users"
            onPress={() => router.push("/settings/muted-users")}
            last
          />
        </Section>

        {/* Data */}
        <Section title="Data & Storage">
          <Row
            icon="data"
            label="Data Saver"
            desc="Reduce data usage"
            toggle
            toggleValue={!!settings.data_saver_mode}
            onToggle={() => toggle("data_saver_mode")}
          />
          <Row
            icon="data"
            label="Auto-download on Wi-Fi"
            toggle
            toggleValue={settings.auto_download_wifi !== false}
            onToggle={() => toggle("auto_download_wifi")}
          />
          <Row
            icon="data"
            label="Auto-download on Cellular"
            toggle
            toggleValue={!!settings.auto_download_cellular}
            onToggle={() => toggle("auto_download_cellular")}
            last
          />
        </Section>

        {/* Support */}
        <Section title="Support">
          <Row
            icon="help"
            iconColor={COLORS.brandSecondary}
            label="Help Centre"
            onPress={() => Linking.openURL("https://texa.app/help")}
          />
          <Row
            icon="info"
            iconColor={COLORS.textMuted}
            label="Terms of Service"
            onPress={() => Linking.openURL("https://texa.app/terms")}
          />
          <Row
            icon="shield"
            iconColor={COLORS.textMuted}
            label="Privacy Policy"
            onPress={() => Linking.openURL("https://texa.app/privacy")}
          />
          <Row
            icon="info"
            iconColor={COLORS.textMuted}
            label={`About ${APP_NAME}`}
            desc="Version 1.0.0"
            last
          />
        </Section>

        {/* Danger Zone */}
        <Section title="Account Actions">
          <Row icon="logout" label="Sign Out" danger onPress={handleSignOut} />
          <Row
            icon="trash"
            label="Delete Account"
            desc="Permanently delete your account"
            danger
            onPress={() =>
              Alert.alert(
                "Delete Account",
                "Are you sure? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => {} },
                ],
              )
            }
            last
          />
        </Section>
      </ScrollView>
    </View>
  );
}
