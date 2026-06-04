import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Filter, Star, ArrowLeft, Plus } from "lucide-react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { COLORS, SHADOW } from "@/constants/theme";

const CATEGORIES = [
  "All",
  "Fashion",
  "Electronics",
  "Beauty",
  "Food",
  "Sports",
  "Home",
  "Books",
  "Toys",
];

export default function StoreBrowseScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState("products"); // products | stores

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["browse-products", search, activeCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (activeCategory !== "All") params.append("category", activeCategory);
      params.append("limit", "30");
      const res = await fetch(`/api/store/products?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    debounce: 400,
  });

  const { data: storesData } = useQuery({
    queryKey: ["browse-stores", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await fetch(`/api/store?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const products = productsData?.products || [];
  const stores = storesData?.stores || [];

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/store/product/${item.id}`)}
      style={{
        width: "48%",
        backgroundColor: COLORS.bg,
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 12,
        ...SHADOW.sm,
      }}
    >
      <ExpoImage
        source={{
          uri: item.thumbnail_url || "https://via.placeholder.com/200",
        }}
        style={{ width: "100%", height: 170 }}
        contentFit="cover"
      />
      {item.original_price && (
        <View
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: COLORS.error,
            borderRadius: 20,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
            -{Math.round((1 - item.price / item.original_price) * 100)}%
          </Text>
        </View>
      )}
      <View style={{ padding: 10 }}>
        <Text
          style={{ color: COLORS.text, fontSize: 13, fontWeight: "600" }}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text
          style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2 }}
          numberOfLines={1}
        >
          {item.store_name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <View>
            <Text
              style={{ color: COLORS.brand, fontSize: 16, fontWeight: "800" }}
            >
              ${parseFloat(item.price).toFixed(2)}
            </Text>
            {item.original_price && (
              <Text
                style={{
                  color: COLORS.textMuted,
                  fontSize: 11,
                  textDecorationLine: "line-through",
                }}
              >
                ${parseFloat(item.original_price).toFixed(2)}
              </Text>
            )}
          </View>
          {item.rating > 0 && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
            >
              <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
              <Text
                style={{ color: COLORS.text, fontSize: 12, fontWeight: "600" }}
              >
                {parseFloat(item.rating).toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgSecondary }}>
      <StatusBar style="dark" />

      {/* Header */}
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
            marginBottom: 12,
            gap: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: COLORS.text,
              flex: 1,
            }}
          >
            🛍️ Shop
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/store/create")}
            style={{
              backgroundColor: COLORS.brand + "15",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 7,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Plus size={15} color={COLORS.brand} />
            <Text
              style={{ color: COLORS.brand, fontSize: 13, fontWeight: "700" }}
            >
              Sell
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: COLORS.bgSecondary,
            borderRadius: 12,
            paddingHorizontal: 12,
            marginBottom: 12,
          }}
        >
          <Search size={16} color={COLORS.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products, stores..."
            placeholderTextColor={COLORS.textMuted}
            style={{
              flex: 1,
              color: COLORS.text,
              fontSize: 15,
              paddingVertical: 10,
              marginLeft: 8,
            }}
          />
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
          {["products", "stores"].map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setViewMode(mode)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  viewMode === mode ? COLORS.brand : COLORS.bgSecondary,
              }}
            >
              <Text
                style={{
                  color: viewMode === mode ? "#fff" : COLORS.textSecondary,
                  fontSize: 14,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Categories */}
      {viewMode === "products" && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            backgroundColor: COLORS.bg,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
            flexGrow: 0,
            maxHeight: 52,
          }}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 8,
          }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor:
                  activeCategory === cat ? COLORS.brand : COLORS.bgSecondary,
                borderWidth: 1,
                borderColor:
                  activeCategory === cat ? COLORS.brand : COLORS.border,
              }}
            >
              <Text
                style={{
                  color: activeCategory === cat ? "#fff" : COLORS.textSecondary,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      {viewMode === "products" ? (
        productsLoading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator color={COLORS.brand} />
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ gap: 12, paddingHorizontal: 12 }}
            contentContainerStyle={{
              paddingTop: 12,
              paddingBottom: insets.bottom + 80,
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🛍️</Text>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  No Products Found
                </Text>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  Be the first to open a store!
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/store/create")}
                  style={{
                    marginTop: 20,
                    backgroundColor: COLORS.brand,
                    borderRadius: 12,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}
                  >
                    Open Store
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            padding: 12,
            paddingBottom: insets.bottom + 80,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/store/${item.id}`)}
              style={{
                backgroundColor: COLORS.bg,
                borderRadius: 16,
                overflow: "hidden",
                ...SHADOW.md,
              }}
            >
              {item.banner_url ? (
                <ExpoImage
                  source={{ uri: item.banner_url }}
                  style={{ width: "100%", height: 100 }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 80,
                    backgroundColor: COLORS.brand + "15",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 36 }}>🏪</Text>
                </View>
              )}
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ExpoImage
                    source={{
                      uri: item.logo_url || "https://via.placeholder.com/44",
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: COLORS.border,
                    }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={{
                        color: COLORS.text,
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                      @{item.username} · {item.category}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      {item.rating > 0 && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Star
                            size={12}
                            color={COLORS.gold}
                            fill={COLORS.gold}
                          />
                          <Text
                            style={{
                              color: COLORS.text,
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {parseFloat(item.rating).toFixed(1)}
                          </Text>
                        </View>
                      )}
                      <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                        {item.product_count} products
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push(`/store/${item.id}`)}
                    style={{
                      backgroundColor: COLORS.brand,
                      borderRadius: 20,
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}
                    >
                      Visit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🏪</Text>
              <Text
                style={{ color: COLORS.text, fontSize: 18, fontWeight: "700" }}
              >
                No Stores Yet
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/store/create")}
                style={{
                  marginTop: 20,
                  backgroundColor: COLORS.brand,
                  borderRadius: 12,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}
                >
                  Open Your Store
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}
