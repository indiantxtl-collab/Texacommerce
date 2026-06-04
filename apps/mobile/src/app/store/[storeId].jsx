import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Share,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Star,
  Package,
  Users,
  Share2,
  MessageCircle,
  Store,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import useUser from "@/utils/auth/useUser";
import { COLORS, SHADOW, APP_NAME } from "@/constants/theme";

export default function StoreProfileScreen() {
  const insets = useSafeAreaInsets();
  const { storeId } = useLocalSearchParams();
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
    queryKey: ["store", storeId],
    queryFn: async () => {
      const res = await fetch(`/api/store/${storeId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const method = store?.isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/store/${storeId}/follow`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["store", storeId]),
  });

  const store = data?.store;
  const products = data?.products || [];

  if (isLoading)
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
        <ActivityIndicator color={COLORS.brand} size="large" />
      </View>
    );

  if (!store)
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
        <Text style={{ color: COLORS.text }}>Store not found</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgSecondary }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          right: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: COLORS.bg,
            alignItems: "center",
            justifyContent: "center",
            ...SHADOW.sm,
          }}
        >
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Share.share({ message: `Check out ${store.name} on ${APP_NAME}!` })
          }
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: COLORS.bg,
            alignItems: "center",
            justifyContent: "center",
            ...SHADOW.sm,
          }}
        >
          <Share2 size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Banner */}
        <View style={{ height: 200, backgroundColor: COLORS.brand + "15" }}>
          {store.banner_url ? (
            <ExpoImage
              source={{ uri: store.banner_url }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Store size={60} color={COLORS.brand + "60"} />
            </View>
          )}
        </View>

        {/* Store Info */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              marginBottom: 16,
            }}
          >
            <ExpoImage
              source={{
                uri: store.logo_url || "https://via.placeholder.com/80",
              }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 18,
                borderWidth: 3,
                borderColor: COLORS.bg,
                marginTop: -40,
              }}
              contentFit="cover"
            />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 20,
                    fontWeight: "800",
                  }}
                >
                  {store.name}
                </Text>
                {store.is_verified && (
                  <View
                    style={{
                      backgroundColor: COLORS.brand,
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 10 }}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                {store.category}
              </Text>
            </View>
          </View>

          {store.description && (
            <Text
              style={{
                color: COLORS.textSecondary,
                fontSize: 14,
                lineHeight: 21,
                marginBottom: 16,
              }}
            >
              {store.description}
            </Text>
          )}

          {/* Stats */}
          <View style={{ flexDirection: "row", gap: 24, marginBottom: 16 }}>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ color: COLORS.text, fontSize: 18, fontWeight: "800" }}
              >
                {store.product_count || 0}
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                Products
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ color: COLORS.text, fontSize: 18, fontWeight: "800" }}
              >
                {store.total_sales || 0}
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                Sales
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ color: COLORS.text, fontSize: 18, fontWeight: "800" }}
              >
                {store.follower_count || 0}
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                Followers
              </Text>
            </View>
            {store.rating > 0 && (
              <View style={{ alignItems: "center" }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    {parseFloat(store.rating).toFixed(1)}
                  </Text>
                </View>
                <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                  Rating
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => followMutation.mutate()}
              disabled={!currentUserId}
              style={{
                flex: 1,
                paddingVertical: 11,
                borderRadius: 12,
                backgroundColor: store.isFollowing
                  ? COLORS.bgSecondary
                  : COLORS.brand,
                borderWidth: store.isFollowing ? 1 : 0,
                borderColor: COLORS.border,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: store.isFollowing ? COLORS.text : "#fff",
                  fontSize: 15,
                  fontWeight: "700",
                }}
              >
                {store.isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/chat/${store.user_id}`)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 11,
                borderRadius: 12,
                backgroundColor: COLORS.bgSecondary,
                borderWidth: 1,
                borderColor: COLORS.border,
                alignItems: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              <MessageCircle size={16} color={COLORS.text} />
              <Text
                style={{ color: COLORS.text, fontSize: 15, fontWeight: "600" }}
              >
                Chat
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Products Grid */}
        <View style={{ padding: 12 }}>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 14,
              marginLeft: 4,
            }}
          >
            Products ({store.product_count || 0})
          </Text>
          {products.length === 0 ? (
            <View
              style={{
                backgroundColor: COLORS.bg,
                borderRadius: 16,
                padding: 40,
                alignItems: "center",
              }}
            >
              <Package
                size={48}
                color={COLORS.textMuted}
                style={{ marginBottom: 12 }}
              />
              <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>
                No products yet
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {products.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => router.push(`/store/product/${p.id}`)}
                  style={{
                    width: "48%",
                    backgroundColor: COLORS.bg,
                    borderRadius: 14,
                    overflow: "hidden",
                    ...SHADOW.sm,
                  }}
                >
                  <ExpoImage
                    source={{
                      uri: p.thumbnail_url || "https://via.placeholder.com/200",
                    }}
                    style={{ width: "100%", height: 160 }}
                    contentFit="cover"
                  />
                  <View style={{ padding: 10 }}>
                    <Text
                      style={{
                        color: COLORS.text,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                      numberOfLines={2}
                    >
                      {p.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: COLORS.brand,
                          fontSize: 15,
                          fontWeight: "800",
                        }}
                      >
                        ${parseFloat(p.price).toFixed(2)}
                      </Text>
                      {p.rating > 0 && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Star
                            size={11}
                            color={COLORS.gold}
                            fill={COLORS.gold}
                          />
                          <Text
                            style={{
                              color: COLORS.textSecondary,
                              fontSize: 11,
                            }}
                          >
                            {parseFloat(p.rating).toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
