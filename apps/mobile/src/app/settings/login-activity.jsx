import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { COLORS } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function LoginActivityScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const { data, isLoading } = useQuery({
    queryKey: ["login-activity", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { activity: [] };
      const res = await fetch(
        `/api/settings/login-activity?userId=${currentUserId}`,
      );
      if (!res.ok) return { activity: [] };
      return res.json();
    },
    enabled: !!currentUserId,
  });

  const activity = data?.activity || [];

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
            Login Activity
          </Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {isLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator color={COLORS.brand} />
          </View>
        ) : activity.length === 0 ? (
          <View
            style={{
              backgroundColor: COLORS.bg,
              borderRadius: 16,
              padding: 28,
              alignItems: "center",
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <TxIcon
              name="eye"
              size={36}
              color={COLORS.textMuted}
              style={{ marginBottom: 12 }}
            />
            <Text
              style={{
                color: COLORS.text,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              No login history yet
            </Text>
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Your recent sign-in activity will appear here
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
            {activity.map((item, idx) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: idx < activity.length - 1 ? 1 : 0,
                  borderBottomColor: COLORS.borderLight,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: item.is_current
                      ? COLORS.successLight
                      : COLORS.bgSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <TxIcon
                    name="phone"
                    size={17}
                    color={item.is_current ? COLORS.success : COLORS.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.text,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {item.device || "Mobile App"}
                    </Text>
                    {item.is_current && (
                      <View
                        style={{
                          backgroundColor: COLORS.successLight,
                          borderRadius: 8,
                          paddingHorizontal: 7,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.success,
                            fontSize: 10,
                            fontWeight: "700",
                          }}
                        >
                          CURRENT
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      color: COLORS.textMuted,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {item.ip_address || "Unknown IP"}
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                    {formatDate(item.logged_in_at)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
