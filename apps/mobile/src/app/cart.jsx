import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
} from "lucide-react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import useUser from "@/utils/auth/useUser";
import { COLORS, SHADOW } from "@/constants/theme";

export default function CartScreen() {
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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cart", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { items: [], total: "0.00", count: 0 };
      const res = await fetch(`/api/cart?userId=${currentUserId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!currentUserId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, productId, quantity }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["cart"]),
  });

  const removeMutation = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, productId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["cart"]),
  });

  const items = data?.items || [];
  const total = data?.total || "0.00";

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
        <ActivityIndicator color={COLORS.brand} />
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: COLORS.text,
              flex: 1,
            }}
          >
            My Cart ({items.length})
          </Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🛒</Text>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 22,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            Your cart is empty
          </Text>
          <Text
            style={{
              color: COLORS.textSecondary,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 28,
            }}
          >
            Discover amazing products from stores on Texa
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
              Start Shopping
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: 12,
              paddingBottom: insets.bottom + 120,
              gap: 10,
            }}
            showsVerticalScrollIndicator={false}
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
                  onPress={() =>
                    router.push(`/store/product/${item.product_id}`)
                  }
                >
                  <ExpoImage
                    source={{
                      uri:
                        item.thumbnail_url || "https://via.placeholder.com/80",
                    }}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                    contentFit="cover"
                  />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: 14,
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.textMuted,
                      fontSize: 12,
                      marginBottom: 8,
                    }}
                  >
                    {item.store_name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.brand,
                        fontSize: 18,
                        fontWeight: "800",
                      }}
                    >
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: COLORS.bgSecondary,
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          updateMutation.mutate({
                            productId: item.product_id,
                            quantity: item.quantity - 1,
                          })
                        }
                        style={{
                          width: 32,
                          height: 32,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 size={15} color={COLORS.error} />
                        ) : (
                          <Minus size={15} color={COLORS.text} />
                        )}
                      </TouchableOpacity>
                      <Text
                        style={{
                          width: 28,
                          textAlign: "center",
                          color: COLORS.text,
                          fontWeight: "700",
                        }}
                      >
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          updateMutation.mutate({
                            productId: item.product_id,
                            quantity: item.quantity + 1,
                          })
                        }
                        style={{
                          width: 32,
                          height: 32,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Plus size={15} color={COLORS.brand} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => removeMutation.mutate(item.product_id)}
                  style={{ position: "absolute", top: 12, right: 12 }}
                >
                  <Trash2 size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Summary */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: COLORS.bg,
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: insets.bottom + 16,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              ...SHADOW.lg,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                Subtotal
              </Text>
              <Text
                style={{ color: COLORS.text, fontSize: 14, fontWeight: "600" }}
              >
                ${total}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                Shipping
              </Text>
              <Text
                style={{
                  color: COLORS.success,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Free
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Text
                style={{ color: COLORS.text, fontSize: 18, fontWeight: "800" }}
              >
                Total
              </Text>
              <Text
                style={{ color: COLORS.brand, fontSize: 22, fontWeight: "900" }}
              >
                ${total}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/checkout")}
              style={{
                backgroundColor: COLORS.brand,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <ShoppingBag size={20} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
                Checkout (${total})
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
