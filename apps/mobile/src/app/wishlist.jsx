import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Heart, ShoppingCart, Star } from "lucide-react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import useUser from "@/utils/auth/useUser";
import { COLORS, SHADOW } from "@/constants/theme";

export default function WishlistScreen() {
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

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { items: [] };
      const res = await fetch(`/api/wishlist?userId=${currentUserId}`);
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: !!currentUserId,
  });

  const removeMutation = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, productId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["wishlist"]),
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      Alert.alert("Added to Cart!", "", [
        { text: "View Cart", onPress: () => router.push("/cart") },
        { text: "OK" },
      ]);
    },
  });

  const items = data?.items || [];

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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.text }}>
            Wishlist ({items.length})
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={COLORS.brand} />
        </View>
      ) : items.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <Text style={{ fontSize: 64, marginBottom: 16 }}>❤️</Text>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 22,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            Wishlist Empty
          </Text>
          <Text
            style={{
              color: COLORS.textSecondary,
              textAlign: "center",
              marginBottom: 28,
            }}
          >
            Save products you love by tapping the heart icon
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/store/browse")}
            style={{
              backgroundColor: COLORS.brand,
              borderRadius: 14,
              paddingHorizontal: 28,
              paddingVertical: 14,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Explore Products
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 12,
            gap: 12,
            paddingBottom: insets.bottom + 80,
          }}
        >
          {items.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: COLORS.bg,
                borderRadius: 16,
                padding: 14,
                flexDirection: "row",
                gap: 12,
                ...SHADOW.sm,
              }}
            >
              <TouchableOpacity
                onPress={() => router.push(`/store/product/${item.product_id}`)}
              >
                <ExpoImage
                  source={{
                    uri: item.thumbnail_url || "https://via.placeholder.com/80",
                  }}
                  style={{ width: 88, height: 88, borderRadius: 12 }}
                  contentFit="cover"
                />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {item.store_name}
                </Text>
                {item.rating > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                      marginTop: 4,
                    }}
                  >
                    <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
                    <Text style={{ color: COLORS.text, fontSize: 12 }}>
                      {parseFloat(item.rating).toFixed(1)}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.brand,
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    ${parseFloat(item.price).toFixed(2)}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => addToCartMutation.mutate(item.product_id)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        backgroundColor: COLORS.brand + "15",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ShoppingCart size={16} color={COLORS.brand} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeMutation.mutate(item.product_id)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        backgroundColor: COLORS.errorLight,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Heart
                        size={16}
                        color={COLORS.error}
                        fill={COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
