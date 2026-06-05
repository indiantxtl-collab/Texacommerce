import { View, Text, ScrollView, ActivityIndicator, Image } from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Package, Truck, CheckCircle, Clock } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";

export default function OrderTracking() {
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/orders/track?orderId=${orderId}`);
      const data = await response.json();
      setOrder(data.order);
      setItems(data.items);
      setTimeline(data.timeline);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const statusIcons = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "#222" }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
          Order #{order?.id}
        </Text>
        <Text style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
          Track your order status
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Store Info */}
        <View
          style={{ padding: 20, flexDirection: "row", alignItems: "center" }}
        >
          {order?.store_logo ? (
            <Image
              source={{ uri: order.store_logo }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                marginRight: 12,
              }}
            />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              {order?.store_name}
            </Text>
            <Text style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
              {new Date(order?.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={{ color: "#10B981", fontSize: 18, fontWeight: "bold" }}>
            ${parseFloat(order?.total_amount || 0).toFixed(2)}
          </Text>
        </View>

        {/* Timeline */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Order Status
          </Text>
          {timeline.map((step, index) => {
            const Icon = statusIcons[step.status];
            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  marginBottom: index < timeline.length - 1 ? 24 : 0,
                }}
              >
                {/* Icon */}
                <View style={{ alignItems: "center", marginRight: 16 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: step.completed ? "#8B5CF6" : "#1a1a1a",
                      borderWidth: 2,
                      borderColor: step.completed ? "#8B5CF6" : "#333",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Icon size={20} color={step.completed ? "#fff" : "#666"} />
                  </View>
                  {index < timeline.length - 1 && (
                    <View
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 40,
                        backgroundColor: step.completed ? "#8B5CF6" : "#333",
                        marginTop: 4,
                      }}
                    />
                  )}
                </View>

                {/* Content */}
                <View style={{ flex: 1, paddingTop: 8 }}>
                  <Text
                    style={{
                      color: step.completed ? "#fff" : "#666",
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                  >
                    {step.label}
                  </Text>
                  {step.completed && step.timestamp && (
                    <Text style={{ color: "#888", fontSize: 13 }}>
                      {new Date(step.timestamp).toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Tracking Number */}
        {order?.tracking_number && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View
              style={{
                backgroundColor: "#1a1a1a",
                padding: 16,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>
                Tracking Number
              </Text>
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                {order.tracking_number}
              </Text>
            </View>
          </View>
        )}

        {/* Shipping Address */}
        {order?.shipping_address && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              Shipping Address
            </Text>
            <View
              style={{
                backgroundColor: "#1a1a1a",
                padding: 16,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                {order.shipping_name}
              </Text>
              <Text style={{ color: "#888", fontSize: 14, lineHeight: 20 }}>
                {order.shipping_address}
              </Text>
              {order.shipping_phone && (
                <Text style={{ color: "#888", fontSize: 14, marginTop: 4 }}>
                  {order.shipping_phone}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Items ({items.length})
          </Text>
          {items.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#1a1a1a",
                padding: 12,
                borderRadius: 12,
                marginBottom: 12,
                flexDirection: "row",
              }}
            >
              {item.product_image ? (
                <Image
                  source={{ uri: item.product_image }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                  numberOfLines={2}
                >
                  {item.product_name}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#888", fontSize: 13 }}>
                    Qty: {item.quantity}
                  </Text>
                  <Text
                    style={{
                      color: "#10B981",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    ${parseFloat(item.total_price).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
