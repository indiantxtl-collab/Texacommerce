import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CreditCard, Banknote, MapPin, Phone, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function EnhancedCheckout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const processCheckout = async () => {
    if (
      !shippingName.trim() ||
      !shippingAddress.trim() ||
      !shippingPhone.trim()
    ) {
      Alert.alert("Error", "Please fill in all shipping details");
      return;
    }

    setLoading(true);
    try {
      // Get cart items (mock for now - in real app, fetch from state/context)
      const cartItems = []; // Replace with actual cart items from context

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          shippingName,
          shippingPhone,
          shippingAddress,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "Order placed successfully!", [
          {
            text: "View Order",
            onPress: () =>
              router.replace(`/order-tracking?orderId=${data.orderId}`),
          },
        ]);
      } else {
        Alert.alert("Error", data.error || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      Alert.alert("Error", "Failed to process checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior="padding"
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <StatusBar style="light" />

        {/* Header */}
        <View
          style={{
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#222",
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
            Checkout
          </Text>
          <Text style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
            Complete your order
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 100,
          }}
        >
          {/* Shipping Information */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Shipping Information
          </Text>

          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <User size={18} color="#888" />
              <Text style={{ color: "#888", fontSize: 14, marginLeft: 8 }}>
                Full Name
              </Text>
            </View>
            <TextInput
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                color: "#fff",
                fontSize: 15,
              }}
              placeholder="John Doe"
              placeholderTextColor="#666"
              value={shippingName}
              onChangeText={setShippingName}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Phone size={18} color="#888" />
              <Text style={{ color: "#888", fontSize: 14, marginLeft: 8 }}>
                Phone Number
              </Text>
            </View>
            <TextInput
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                color: "#fff",
                fontSize: 15,
              }}
              placeholder="+1 234 567 8900"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={shippingPhone}
              onChangeText={setShippingPhone}
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <MapPin size={18} color="#888" />
              <Text style={{ color: "#888", fontSize: 14, marginLeft: 8 }}>
                Delivery Address
              </Text>
            </View>
            <TextInput
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                color: "#fff",
                fontSize: 15,
                minHeight: 100,
                textAlignVertical: "top",
              }}
              placeholder="Street address, city, state, ZIP"
              placeholderTextColor="#666"
              multiline
              value={shippingAddress}
              onChangeText={setShippingAddress}
            />
          </View>

          {/* Payment Method */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Payment Method
          </Text>

          <TouchableOpacity
            onPress={() => setPaymentMethod("COD")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor:
                paymentMethod === "COD" ? "#8B5CF620" : "#1a1a1a",
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 2,
              borderColor: paymentMethod === "COD" ? "#8B5CF6" : "#1a1a1a",
            }}
          >
            <Banknote
              size={24}
              color={paymentMethod === "COD" ? "#8B5CF6" : "#888"}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Cash on Delivery
              </Text>
              <Text style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
                Pay when you receive
              </Text>
            </View>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: paymentMethod === "COD" ? "#8B5CF6" : "#666",
                backgroundColor:
                  paymentMethod === "COD" ? "#8B5CF6" : "transparent",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {paymentMethod === "COD" && (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#fff",
                  }}
                />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPaymentMethod("Card")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor:
                paymentMethod === "Card" ? "#8B5CF620" : "#1a1a1a",
              padding: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: paymentMethod === "Card" ? "#8B5CF6" : "#1a1a1a",
            }}
          >
            <CreditCard
              size={24}
              color={paymentMethod === "Card" ? "#8B5CF6" : "#888"}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Credit/Debit Card
              </Text>
              <Text style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
                Visa, Mastercard, Amex
              </Text>
            </View>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: paymentMethod === "Card" ? "#8B5CF6" : "#666",
                backgroundColor:
                  paymentMethod === "Card" ? "#8B5CF6" : "transparent",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {paymentMethod === "Card" && (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#fff",
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Action */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 20,
            paddingBottom: insets.bottom + 20,
            backgroundColor: "#000",
            borderTopWidth: 1,
            borderTopColor: "#222",
          }}
        >
          <TouchableOpacity
            onPress={processCheckout}
            disabled={loading}
            style={{
              backgroundColor: "#8B5CF6",
              padding: 18,
              borderRadius: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
                >
                  Place Order
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
