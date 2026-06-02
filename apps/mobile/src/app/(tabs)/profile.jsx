import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";
import { Image as ExpoImage } from "expo-image";
import { COLORS, SHADOW, LOGO_URL } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const { signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadUser = async () => {
    if (authUser?.email) {
      const res = await fetch(
        `/api/profile/user-by-auth-id?email=${authUser.email}`,
      );
      const data = await res.json();
      if (data.user) setCurrentUser(data.user);
    }
  };

  useEffect(() => {
    loadUser();
  }, [authUser]);

  const { data: storeData } = useQuery({
    queryKey: ["my-store", currentUser?.id],
    queryFn: async () => {
      const res = await fetch(`/api/store/my-store?userId=${currentUser.id}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  };

  const handleSignOut = () =>
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () =>
          signOut({ callbackUrl: "/account/signin", redirect: true }),
      },
    ]);

  if (!currentUser)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar style="dark" />
        <Text style={{ color: COLORS.textMuted }}>Loading profile...</Text>
      </View>
    );

  const myStore = storeData?.store;

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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: COLORS.text,
              flex: 1,
            }}
          >
            @{currentUser.username}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLORS.bgSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TxIcon name="settings" size={17} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.brand}
          />
        }
      >
        {/* Profile Card */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            marginBottom: 8,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingTop: 20,
              gap: 16,
            }}
          >
            <View style={{ position: "relative" }}>
              <ExpoImage
                source={{
                  uri:
                    currentUser.profile_picture ||
                    "https://via.placeholder.com/88",
                }}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  borderWidth: 3,
                  borderColor: COLORS.brand,
                }}
                contentFit="cover"
              />
              <TouchableOpacity
                onPress={() => router.push("/edit-profile")}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: COLORS.brand,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: COLORS.bg,
                }}
              >
                <TxIcon name="edit" size={11} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: "row", justifyContent: "space-around" }}
              >
                {[
                  ["Posts", 0],
                  ["Followers", 0],
                  ["Following", 0],
                ].map(([label, val], i) => (
                  <React.Fragment key={label}>
                    {i > 0 && (
                      <View
                        style={{ width: 1, backgroundColor: COLORS.border }}
                      />
                    )}
                    <View style={{ alignItems: "center", flex: 1 }}>
                      <Text
                        style={{
                          color: COLORS.text,
                          fontSize: 18,
                          fontWeight: "800",
                        }}
                      >
                        {val}
                      </Text>
                      <Text
                        style={{
                          color: COLORS.textSecondary,
                          fontSize: 11,
                          marginTop: 1,
                        }}
                      >
                        {label}
                      </Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text
                style={{ color: COLORS.text, fontSize: 17, fontWeight: "700" }}
              >
                {currentUser.full_name}
              </Text>
              {currentUser.verified && (
                <View
                  style={{
                    backgroundColor: COLORS.brand,
                    width: 17,
                    height: 17,
                    borderRadius: 9,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TxIcon name="check" size={9} color="#fff" />
                </View>
              )}
            </View>
            {currentUser.bio && (
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 13,
                  marginTop: 3,
                  lineHeight: 19,
                }}
              >
                {currentUser.bio}
              </Text>
            )}

            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: COLORS.gold + "15",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}
              >
                <TxIcon name="coin" size={14} color={COLORS.gold} />
                <Text
                  style={{
                    color: COLORS.gold,
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  {currentUser.coins}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: COLORS.brand + "15",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}
              >
                <TxIcon name="zapFill" size={14} color={COLORS.brand} />
                <Text
                  style={{
                    color: COLORS.brand,
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  Level {currentUser.level}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => router.push("/edit-profile")}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  backgroundColor: COLORS.bgSecondary,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  Edit Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/prestige-card")}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  backgroundColor: COLORS.gold + "15",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: COLORS.gold + "40",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <TxIcon name="sparkle" size={13} color={COLORS.gold} />
                <Text
                  style={{
                    color: COLORS.gold,
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  Prestige
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Store */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            marginBottom: 8,
            padding: 14,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          {myStore ? (
            <TouchableOpacity
              onPress={() => router.push(`/store/${myStore.id}`)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.brand + "08",
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: COLORS.brand + "30",
              }}
            >
              <ExpoImage
                source={{ uri: myStore.logo_url || LOGO_URL }}
                style={{ width: 44, height: 44, borderRadius: 10 }}
                contentFit="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  {myStore.name}
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                  {myStore.category}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 3,
                  }}
                >
                  <TxIcon name="starFill" size={11} color={COLORS.gold} />
                  <Text
                    style={{
                      color: COLORS.gold,
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    {myStore.rating || "New"}
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                    · {myStore.total_sales} sales
                  </Text>
                </View>
              </View>
              <Text
                style={{ color: COLORS.brand, fontSize: 13, fontWeight: "600" }}
              >
                Manage →
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/store/create")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.bgSecondary,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1.5,
                borderColor: COLORS.border,
                borderStyle: "dashed",
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: COLORS.brand + "15",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TxIcon name="store" size={22} color={COLORS.brand} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  Open Your Store
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                  Start selling to millions of users
                </Text>
              </View>
              <Text
                style={{ color: COLORS.brand, fontSize: 13, fontWeight: "600" }}
              >
                Open →
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Links */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            marginBottom: 8,
            paddingVertical: 4,
          }}
        >
          {[
            {
              icon: "bag",
              label: "My Orders",
              desc: "Track & manage orders",
              route: "/orders",
              color: COLORS.brandSecondary,
            },
            {
              icon: "heartFill",
              label: "Wishlist",
              desc: "Saved products",
              route: "/wishlist",
              color: COLORS.brandPink,
            },
            {
              icon: "award",
              label: "Prestige Card",
              desc: "Digital membership",
              route: "/prestige-card",
              color: COLORS.gold,
            },
            {
              icon: "zap",
              label: "Battles History",
              desc: "Past battles & earnings",
              route: "/battles",
              color: COLORS.brand,
            },
          ].map(({ icon, label, desc, route, color }) => (
            <TouchableOpacity
              key={label}
              onPress={() => router.push(route)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 13,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.borderLight,
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: color + "15",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <TxIcon name={icon} size={18} color={color} />
              </View>
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
                    fontSize: 11,
                    marginTop: 1,
                  }}
                >
                  {desc}
                </Text>
              </View>
              <TxIcon name="chevronRight" size={17} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={{
            backgroundColor: COLORS.bg,
            marginBottom: 8,
            paddingVertical: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 13,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.borderLight,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: COLORS.bgSecondary,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <TxIcon name="settings" size={18} color={COLORS.textSecondary} />
            </View>
            <Text
              style={{
                color: COLORS.text,
                fontSize: 14,
                fontWeight: "600",
                flex: 1,
              }}
            >
              Settings
            </Text>
            <TxIcon name="chevronRight" size={17} color={COLORS.textLight} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 13,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: COLORS.errorLight,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <TxIcon name="logout" size={18} color={COLORS.error} />
            </View>
            <Text
              style={{
                color: COLORS.error,
                fontSize: 14,
                fontWeight: "600",
                flex: 1,
              }}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
