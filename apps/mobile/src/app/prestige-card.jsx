import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Share, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Share2, Star, Award, Zap } from "lucide-react-native";
import { router } from "expo-router";
import useUser from "@/utils/auth/useUser";
import { Image as ExpoImage } from "expo-image";
import { COLORS, SHADOW, LOGO_URL, APP_NAME } from "@/constants/theme";

const getLevelName = (level) => {
  if (level >= 30) return "Diamond";
  if (level >= 20) return "Platinum";
  if (level >= 15) return "Gold";
  if (level >= 10) return "Silver";
  return "Bronze";
};

const getLevelColor = (level) => {
  if (level >= 30) return "#00B4D8";
  if (level >= 20) return "#B0B0B0";
  if (level >= 15) return "#F5A623";
  if (level >= 10) return "#A0A0A0";
  return "#CD7F32";
};

export default function PrestigeCardScreen() {
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my ${APP_NAME} Prestige Card! Level ${currentUser?.level} ${getLevelName(currentUser?.level || 1)} member 🏆`,
      });
    } catch {}
  };

  const levelColor = getLevelColor(currentUser?.level || 1);
  const levelName = getLevelName(currentUser?.level || 1);
  const cardId = currentUser?.id?.toString().padStart(8, "0") || "00000000";

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.text }}>
            Prestige Card
          </Text>
          <TouchableOpacity onPress={handleShare}>
            <Share2 size={22} color={COLORS.brand} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          gap: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Digital Card */}
        <View
          style={{
            borderRadius: 24,
            overflow: "hidden",
            ...SHADOW.lg,
          }}
        >
          {/* Card Background */}
          <View
            style={{
              backgroundColor: "#1a1a2e",
              padding: 24,
              minHeight: 220,
            }}
          >
            {/* Decorative circles */}
            <View
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 150,
                height: 150,
                borderRadius: 75,
                backgroundColor: levelColor + "20",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -20,
                left: -20,
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: COLORS.brand + "20",
              }}
            />

            {/* Card Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <ExpoImage
                  source={{ uri: LOGO_URL }}
                  style={{ width: 32, height: 32, borderRadius: 8 }}
                  contentFit="contain"
                />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 20,
                    fontWeight: "900",
                    letterSpacing: 2,
                  }}
                >
                  {APP_NAME}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: levelColor + "30",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderWidth: 1,
                  borderColor: levelColor,
                }}
              >
                <Text
                  style={{ color: levelColor, fontSize: 13, fontWeight: "700" }}
                >
                  {levelName}
                </Text>
              </View>
            </View>

            {/* Avatar */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <ExpoImage
                source={{
                  uri:
                    currentUser?.profile_picture ||
                    "https://via.placeholder.com/60",
                }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  borderWidth: 3,
                  borderColor: levelColor,
                }}
                contentFit="cover"
              />
              <View>
                <Text
                  style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}
                >
                  {currentUser?.full_name || "..."}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                  @{currentUser?.username || "..."}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={{ flexDirection: "row", gap: 16 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 10,
                    marginBottom: 4,
                  }}
                >
                  COINS
                </Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Text style={{ fontSize: 16 }}>🪙</Text>
                  <Text
                    style={{
                      color: COLORS.gold,
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    {currentUser?.coins || 0}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 10,
                    marginBottom: 4,
                  }}
                >
                  LEVEL
                </Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Text style={{ fontSize: 16 }}>⚡</Text>
                  <Text
                    style={{
                      color: COLORS.brand,
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    {currentUser?.level || 1}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 10,
                    marginBottom: 4,
                  }}
                >
                  XP
                </Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Text style={{ fontSize: 16 }}>🏆</Text>
                  <Text
                    style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}
                  >
                    {currentUser?.xp || 0}
                  </Text>
                </View>
              </View>
            </View>

            {/* Card Footer */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 10,
                    letterSpacing: 1,
                  }}
                >
                  MEMBER ID
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 16,
                    fontWeight: "700",
                    letterSpacing: 2,
                  }}
                >
                  {cardId}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: levelColor + "20",
                  borderRadius: 10,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: levelColor + "60",
                }}
              >
                <Star size={20} color={levelColor} fill={levelColor} />
              </View>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 20,
            padding: 20,
            ...SHADOW.sm,
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 16,
            }}
          >
            Your Benefits
          </Text>
          {[
            {
              icon: "⚡",
              label: "Daily Battles Access",
              desc: "Earn coins with choice trading",
              color: COLORS.brand,
            },
            {
              icon: "🛍️",
              label: "Exclusive Deals",
              desc: "Get discounts from partner stores",
              color: COLORS.brandPink,
            },
            {
              icon: "🎙️",
              label: "Priority Voice Rooms",
              desc: "Get featured in live rooms",
              color: COLORS.brandSecondary,
            },
            {
              icon: "⭐",
              label: `${levelName} Status`,
              desc: "Recognized prestige member",
              color: levelColor,
            },
          ].map(({ icon, label, desc, color }) => (
            <View
              key={label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.borderLight,
              }}
            >
              <Text style={{ fontSize: 24, width: 40 }}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 12,
                    marginTop: 1,
                  }}
                >
                  {desc}
                </Text>
              </View>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: color,
                }}
              />
            </View>
          ))}
        </View>

        {/* Share Button */}
        <TouchableOpacity
          onPress={handleShare}
          style={{
            backgroundColor: COLORS.brand,
            borderRadius: 14,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Share2 size={20} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Share Your Card
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
