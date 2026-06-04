import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  CheckCircle,
} from "lucide-react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import useUser from "@/utils/auth/useUser";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { COLORS, SHADOW } from "@/constants/theme";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: "💵" },
  { id: "card", label: "Credit / Debit Card", icon: "💳" },
  { id: "coins", label: "Pay with Coins", icon: "🪙" },
];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.user) {
            setCurrentUserId(d.user.id);
            setName(d.user.full_name || "");
            setPhone(d.user.phone || "");
          }
        });
    }
  }, [authUser]);

  const { data: cartData } = useQuery({
    queryKey: ["cart", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { items: [], total: "0.00" };
      const res = await fetch(`/api/cart?userId=${currentUserId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!currentUserId,
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (!name || !address)
        throw new Error("Please fill in all required fields");
      const items = (cartData?.items || []).map((item) => ({
        productId: item.product_id,
        name: item.name,
        image: item.thumbnail_url,
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
      }));

      if (!items.length) throw new Error("Your cart is empty");

      const storeGroups = {};
      items.forEach((item) => {
        const storeId = cartData.items.find(
          (ci) => ci.product_id === item.productId,
        )?.store_id;
        if (!storeGroups[storeId]) storeGroups[storeId] = [];
        storeGroups[storeId].push(item);
      });

      const orders = [];
      for (const [storeId, storeItems] of Object.entries(storeGroups)) {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            storeId: parseInt(storeId),
            items: storeItems,
            shippingName: name,
            shippingPhone: phone,
            shippingAddress: address,
            paymentMethod,
          }),
        });
        if (!res.ok) throw new Error("Failed to place order");
        orders.push(await res.json());
      }

      return orders;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      queryClient.invalidateQueries(["orders"]);
      Alert.alert(
        "🎉 Order Placed!",
        "Your order has been placed successfully. You can track it in your orders.",
        [{ text: "Track Orders", onPress: () => router.replace("/orders") }],
      );
    },
    onError: (e) => Alert.alert("Error", e.message),
  });

  const items = cartData?.items || [];
  const total = cartData?.total || "0.00";

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: COLORS.bgSecondary }}
    >
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
            Checkout
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 120,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Shipping Info */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 16,
            padding: 16,
            ...SHADOW.sm,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <MapPin size={18} color={COLORS.brand} />
            <Text
              style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}
            >
              Shipping Information
            </Text>
          </View>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            Full Name *
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.bgSecondary,
              borderRadius: 10,
              paddingHorizontal: 12,
              marginBottom: 12,
            }}
          >
            <User size={16} color={COLORS.textMuted} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={COLORS.textMuted}
              style={{
                flex: 1,
                color: COLORS.text,
                fontSize: 15,
                paddingVertical: 12,
                marginLeft: 8,
              }}
            />
          </View>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            Phone
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.bgSecondary,
              borderRadius: 10,
              paddingHorizontal: 12,
              marginBottom: 12,
            }}
          >
            <Phone size={16} color={COLORS.textMuted} />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.textMuted}
              style={{
                flex: 1,
                color: COLORS.text,
                fontSize: 15,
                paddingVertical: 12,
                marginLeft: 8,
              }}
            />
          </View>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            Delivery Address *
          </Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Full delivery address"
            placeholderTextColor={COLORS.textMuted}
            multiline
            style={{
              backgroundColor: COLORS.bgSecondary,
              borderRadius: 10,
              padding: 12,
              color: COLORS.text,
              fontSize: 15,
              minHeight: 80,
            }}
          />
        </View>

        {/* Payment Method */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 16,
            padding: 16,
            ...SHADOW.sm,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <CreditCard size={18} color={COLORS.brand} />
            <Text
              style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}
            >
              Payment Method
            </Text>
          </View>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setPaymentMethod(method.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderRadius: 12,
                marginBottom: 8,
                borderWidth: 2,
                borderColor:
                  paymentMethod === method.id ? COLORS.brand : COLORS.border,
                backgroundColor:
                  paymentMethod === method.id ? COLORS.brand + "08" : COLORS.bg,
              }}
            >
              <Text style={{ fontSize: 22, marginRight: 12 }}>
                {method.icon}
              </Text>
              <Text
                style={{
                  color: COLORS.text,
                  fontSize: 15,
                  fontWeight: "600",
                  flex: 1,
                }}
              >
                {method.label}
              </Text>
              {paymentMethod === method.id && (
                <CheckCircle
                  size={20}
                  color={COLORS.brand}
                  fill={COLORS.brand + "30"}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 16,
            padding: 16,
            ...SHADOW.sm,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Truck size={18} color={COLORS.brand} />
            <Text
              style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}
            >
              Order Summary
            </Text>
          </View>
          {items.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                gap: 10,
              }}
            >
              <ExpoImage
                source={{
                  uri: item.thumbnail_url || "https://via.placeholder.com/50",
                }}
                style={{ width: 50, height: 50, borderRadius: 8 }}
                contentFit="cover"
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text
                style={{ color: COLORS.text, fontSize: 14, fontWeight: "700" }}
              >
                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              paddingTop: 12,
              marginTop: 4,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text style={{ color: COLORS.textSecondary }}>Subtotal</Text>
              <Text style={{ color: COLORS.text, fontWeight: "600" }}>
                ${total}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ color: COLORS.textSecondary }}>Shipping</Text>
              <Text style={{ color: COLORS.success, fontWeight: "600" }}>
                Free ✓
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: COLORS.bg,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: COLORS.textSecondary, fontSize: 15 }}>
            Total
          </Text>
          <Text
            style={{ color: COLORS.brand, fontSize: 24, fontWeight: "900" }}
          >
            ${total}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => placeOrderMutation.mutate()}
          disabled={placeOrderMutation.isPending}
          style={{
            backgroundColor: COLORS.brand,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          {placeOrderMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
              Place Order · ${total}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
