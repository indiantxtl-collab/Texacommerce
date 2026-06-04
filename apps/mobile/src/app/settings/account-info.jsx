import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import useUser from "@/utils/auth/useUser";
import { COLORS, LOGO_URL } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function AccountInfoScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUser(d.user));
    }
  }, [authUser]);

  const InfoRow = ({ label, value, last }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: COLORS.borderLight,
        backgroundColor: COLORS.bg,
      }}
    >
      <Text style={{ color: COLORS.textSecondary, fontSize: 13, width: 120 }}>
        {label}
      </Text>
      <Text
        style={{ color: COLORS.text, fontSize: 14, fontWeight: "500", flex: 1 }}
        numberOfLines={1}
      >
        {value || "—"}
      </Text>
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
            Account Information
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {currentUser && (
          <View
            style={{
              alignItems: "center",
              padding: 24,
              backgroundColor: COLORS.bg,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: COLORS.border,
              marginBottom: 8,
            }}
          >
            <ExpoImage
              source={{ uri: currentUser.profile_picture || LOGO_URL }}
              style={{
                width: 78,
                height: 78,
                borderRadius: 39,
                borderWidth: 3,
                borderColor: COLORS.brand,
                marginBottom: 12,
              }}
              contentFit="cover"
            />
            <Text
              style={{ color: COLORS.text, fontSize: 20, fontWeight: "700" }}
            >
              {currentUser.full_name}
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
              @{currentUser.username}
            </Text>
          </View>
        )}

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
          Profile Details
        </Text>
        <View
          style={{
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 8,
          }}
        >
          <InfoRow label="Full Name" value={currentUser?.full_name} />
          <InfoRow label="Username" value={`@${currentUser?.username}`} />
          <InfoRow label="Email" value={currentUser?.email} />
          <InfoRow label="Phone" value={currentUser?.phone} />
          <InfoRow
            label="Date of Birth"
            value={currentUser?.date_of_birth}
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
          Account Status
        </Text>
        <View
          style={{
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 8,
          }}
        >
          <InfoRow label="Level" value={`Level ${currentUser?.level || 1}`} />
          <InfoRow label="XP Points" value={`${currentUser?.xp || 0} XP`} />
          <InfoRow label="Coins" value={`${currentUser?.coins || 0} coins`} />
          <InfoRow
            label="Verified"
            value={currentUser?.verified ? "Yes" : "Not verified"}
          />
          <InfoRow
            label="Member Since"
            value={
              currentUser?.created_at
                ? new Date(currentUser.created_at).toLocaleDateString([], {
                    month: "long",
                    year: "numeric",
                  })
                : "—"
            }
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
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: 13,
              lineHeight: 20,
              textAlign: "center",
            }}
          >
            To update your account information, use Edit Profile. To change your
            password, go to Change Password in Security Settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
