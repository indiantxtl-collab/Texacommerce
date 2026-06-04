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
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import useUser from "@/utils/auth/useUser";
import { COLORS, SHADOW } from "@/constants/theme";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: COLORS.warning,
    bg: COLORS.warningLight,
    label: "Pending",
  },
  processing: {
    icon: Package,
    color: COLORS.info,
    bg: COLORS.infoLight,
    label: "Processing",
  },
  shipped: {
    icon: Truck,
    color: COLORS.brandSecondary,
    bg: COLORS.brandSecondary + "15",
    label: "Shipped",
  },
  delivered: {
    icon: CheckCircle,
    color: COLORS.success,
    bg: COLORS.successLight,
    label: "Delivered",
  },
  cancelled: {
    icon: XCircle,
    color: COLORS.error,
    bg: COLORS.errorLight,
    label: "Cancelled",
  },
};

export default function OrdersScreen() {
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
    queryKey: ["orders", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { orders: [] };
      const res = await fetch(`/api/orders?userId=${currentUserId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!currentUserId,
  });

  const orders = data?.orders || [];

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
            My Orders
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={COLORS.brand} size="large" />
        </View>
      ) : orders.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📦</Text>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 22,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            No Orders Yet
          </Text>
          <Text
            style={{
              color: COLORS.textSecondary,
              textAlign: "center",
              marginBottom: 28,
            }}
          >
            When you place an order, it will appear here
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
              Shop Now
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 12,
            paddingBottom: insets.bottom + 80,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            return (
              <View
                key={order.id}
                style={{
                  backgroundColor: COLORS.bg,
                  borderRadius: 16,
                  overflow: "hidden",
                  ...SHADOW.sm,
                }}
              >
                {/* Order Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.borderLight,
                  }}
                >
                  <ExpoImage
                    source={{
                      uri: order.store_logo || "https://via.placeholder.com/40",
                    }}
                    style={{ width: 40, height: 40, borderRadius: 10 }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text
                      style={{
                        color: COLORS.text,
                        fontSize: 14,
                        fontWeight: "700",
                      }}
                    >
                      {order.store_name}
                    </Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                      Order #{order.id} ·{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: config.bg,
                      borderRadius: 20,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <StatusIcon size={13} color={config.color} />
                    <Text
                      style={{
                        color: config.color,
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {config.label}
                    </Text>
                  </View>
                </View>

                {/* Items Preview */}
                <View style={{ padding: 14 }}>
                  {order.items?.slice(0, 3).map((item, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: i < order.items.length - 1 ? 8 : 0,
                      }}
                    >
                      {item.image && (
                        <ExpoImage
                          source={{ uri: item.image }}
                          style={{ width: 44, height: 44, borderRadius: 8 }}
                          contentFit="cover"
                        />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: COLORS.text,
                            fontSize: 13,
                            fontWeight: "500",
                          }}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                          Qty: {item.qty} · ${item.price}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {order.items?.length > 3 && (
                    <Text
                      style={{
                        color: COLORS.textMuted,
                        fontSize: 12,
                        marginTop: 8,
                      }}
                    >
                      +{order.items.length - 3} more items
                    </Text>
                  )}
                </View>

                {/* Footer */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.borderLight,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                      Total Amount
                    </Text>
                    <Text
                      style={{
                        color: COLORS.brand,
                        fontSize: 18,
                        fontWeight: "800",
                      }}
                    >
                      ${order.total_amount}
                    </Text>
                  </View>
                  {order.tracking_number && (
                    <View>
                      <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                        Tracking
                      </Text>
                      <Text
                        style={{
                          color: COLORS.brandSecondary,
                          fontSize: 13,
                          fontWeight: "600",
                        }}
                      >
                        {order.tracking_number}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
