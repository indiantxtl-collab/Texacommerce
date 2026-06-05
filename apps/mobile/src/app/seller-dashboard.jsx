import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Package,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Plus,
  Edit,
} from "lucide-react-native";
import { useRouter } from "expo-router";

export default function SellerDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const loadData = async () => {
    try {
      const response = await fetch("/api/orders/seller-dashboard");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      loadData();
    } catch (error) {
      console.error("Error updating order:", error);
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

  if (!data?.store) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: insets.top,
          padding: 20,
        }}
      >
        <StatusBar style="light" />
        <Package size={64} color="#666" />
        <Text
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: "bold",
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          No Store Found
        </Text>
        <Text
          style={{
            color: "#888",
            fontSize: 14,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Create your first store to start selling
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/store/create")}
          style={{
            backgroundColor: "#8B5CF6",
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Create Store
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "#222" }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
          {data.store.name}
        </Text>
        <Text style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
          Seller Dashboard
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Stats */}
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Overview
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <View
              style={{
                flex: 1,
                minWidth: 150,
                backgroundColor: "#1a1a1a",
                padding: 16,
                borderRadius: 12,
              }}
            >
              <DollarSign size={24} color="#10B981" />
              <Text
                style={{
                  color: "#888",
                  fontSize: 12,
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                Total Revenue
              </Text>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                ${parseFloat(data.stats.total_revenue || 0).toFixed(2)}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                minWidth: 150,
                backgroundColor: "#1a1a1a",
                padding: 16,
                borderRadius: 12,
              }}
            >
              <ShoppingBag size={24} color="#8B5CF6" />
              <Text
                style={{
                  color: "#888",
                  fontSize: 12,
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                Total Orders
              </Text>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                {data.stats.total_orders}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                minWidth: 150,
                backgroundColor: "#1a1a1a",
                padding: 16,
                borderRadius: 12,
              }}
            >
              <Package size={24} color="#F59E0B" />
              <Text
                style={{
                  color: "#888",
                  fontSize: 12,
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                Pending
              </Text>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                {data.stats.pending_orders}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                minWidth: 150,
                backgroundColor: "#1a1a1a",
                padding: 16,
                borderRadius: 12,
              }}
            >
              <TrendingUp size={24} color="#3B82F6" />
              <Text
                style={{
                  color: "#888",
                  fontSize: 12,
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                Completed
              </Text>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                {data.stats.completed_orders}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#fff" }}>
              Recent Orders
            </Text>
          </View>
          {data.orders.slice(0, 10).map((order) => (
            <View
              key={order.id}
              style={{
                backgroundColor: "#1a1a1a",
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}
                >
                  Order #{order.id}
                </Text>
                <Text
                  style={{ color: "#10B981", fontSize: 15, fontWeight: "600" }}
                >
                  ${parseFloat(order.total_amount).toFixed(2)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                {order.buyer_picture ? (
                  <Image
                    source={{ uri: order.buyer_picture }}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      marginRight: 8,
                    }}
                  />
                ) : null}
                <Text style={{ color: "#888", fontSize: 13 }}>
                  @{order.buyer_username}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor:
                      order.status === "pending"
                        ? "#F59E0B20"
                        : order.status === "delivered"
                          ? "#10B98120"
                          : "#8B5CF620",
                  }}
                >
                  <Text
                    style={{
                      color:
                        order.status === "pending"
                          ? "#F59E0B"
                          : order.status === "delivered"
                            ? "#10B981"
                            : "#8B5CF6",
                      fontSize: 12,
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {order.status}
                  </Text>
                </View>
                {order.status === "pending" && (
                  <TouchableOpacity
                    onPress={() => updateOrderStatus(order.id, "processing")}
                    style={{
                      backgroundColor: "#8B5CF6",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}
                    >
                      Process
                    </Text>
                  </TouchableOpacity>
                )}
                {order.status === "processing" && (
                  <TouchableOpacity
                    onPress={() => updateOrderStatus(order.id, "shipped")}
                    style={{
                      backgroundColor: "#3B82F6",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}
                    >
                      Ship
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Products */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#fff" }}>
              Products
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/store/create")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#8B5CF6",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Plus size={16} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "600",
                  marginLeft: 4,
                }}
              >
                Add Product
              </Text>
            </TouchableOpacity>
          </View>
          {data.products.slice(0, 5).map((product) => (
            <View
              key={product.id}
              style={{
                backgroundColor: "#1a1a1a",
                padding: 12,
                borderRadius: 12,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {product.thumbnail_url ? (
                <Image
                  source={{ uri: product.thumbnail_url }}
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
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                <Text
                  style={{ color: "#10B981", fontSize: 14, fontWeight: "600" }}
                >
                  ${parseFloat(product.price).toFixed(2)}
                </Text>
                <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
                  Stock: {product.stock_qty} | Sold: {product.sold_count}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
