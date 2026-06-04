import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { COLORS, SHADOW } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { users: [], stores: [], products: [] };
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: searchQuery.trim().length > 1,
  });

  const users = searchResults?.users || [];
  const stores = searchResults?.stores || [];
  const products = searchResults?.products || [];
  const hasResults =
    users.length > 0 || stores.length > 0 || products.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar style="dark" />
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 12,
          paddingBottom: 12,
          backgroundColor: COLORS.bg,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <TxIcon name="back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.bgSecondary,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}
          >
            <TxIcon name="search" size={17} color={COLORS.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search people, stores, products..."
              placeholderTextColor={COLORS.textMuted}
              autoFocus
              returnKeyType="search"
              style={{
                flex: 1,
                color: COLORS.text,
                fontSize: 15,
                paddingVertical: 11,
                marginLeft: 8,
              }}
            />
            {isLoading && (
              <ActivityIndicator size="small" color={COLORS.brand} />
            )}
          </View>
        </View>

        {/* Filter tabs */}
        {hasResults && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10, flexGrow: 0 }}
            contentContainerStyle={{ gap: 8 }}
          >
            {["all", "people", "stores", "products"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor:
                    activeTab === tab ? COLORS.brand : COLORS.bgSecondary,
                }}
              >
                <Text
                  style={{
                    color: activeTab === tab ? "#fff" : COLORS.textSecondary,
                    fontSize: 13,
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {!searchQuery.trim() ? (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: COLORS.bgSecondary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <TxIcon name="search" size={32} color={COLORS.textMuted} />
            </View>
            <Text
              style={{
                color: COLORS.text,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              Discover
            </Text>
            <Text style={{ color: COLORS.textSecondary, textAlign: "center" }}>
              Search for people, stores, and products
            </Text>
          </View>
        ) : searchQuery.trim().length > 0 && !hasResults && !isLoading ? (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                backgroundColor: COLORS.bgSecondary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <TxIcon name="search" size={30} color={COLORS.textMuted} />
            </View>
            <Text
              style={{ color: COLORS.text, fontSize: 18, fontWeight: "700" }}
            >
              No results found
            </Text>
            <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>
              Try different keywords
            </Text>
          </View>
        ) : (
          <View>
            {/* People */}
            {(activeTab === "all" || activeTab === "people") &&
              users.length > 0 && (
                <View>
                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 11,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      paddingHorizontal: 16,
                      paddingTop: 16,
                      paddingBottom: 8,
                    }}
                  >
                    People
                  </Text>
                  {users.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      onPress={() => router.push(`/user/${user.username}`)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: COLORS.borderLight,
                      }}
                    >
                      <ExpoImage
                        source={{
                          uri:
                            user.profile_picture ||
                            "https://via.placeholder.com/50",
                        }}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          borderWidth: 2,
                          borderColor: user.verified
                            ? COLORS.brand
                            : "transparent",
                        }}
                        contentFit="cover"
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Text
                            style={{
                              color: COLORS.text,
                              fontSize: 15,
                              fontWeight: "700",
                            }}
                          >
                            {user.full_name}
                          </Text>
                          {user.verified && (
                            <View
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 8,
                                backgroundColor: COLORS.brand,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <TxIcon name="check" size={9} color="#fff" />
                            </View>
                          )}
                        </View>
                        <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                          @{user.username}
                        </Text>
                        {user.bio && (
                          <Text
                            style={{
                              color: COLORS.textSecondary,
                              fontSize: 12,
                              marginTop: 2,
                            }}
                            numberOfLines={1}
                          >
                            {user.bio}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={{
                          color: COLORS.brand,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {user.followers_count || 0} followers
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

            {/* Stores */}
            {(activeTab === "all" || activeTab === "stores") &&
              stores.length > 0 && (
                <View>
                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 11,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      paddingHorizontal: 16,
                      paddingTop: 16,
                      paddingBottom: 8,
                    }}
                  >
                    Stores
                  </Text>
                  {stores.map((store) => (
                    <TouchableOpacity
                      key={store.id}
                      onPress={() => router.push(`/store/${store.id}`)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: COLORS.borderLight,
                      }}
                    >
                      <ExpoImage
                        source={{
                          uri:
                            store.logo_url || "https://via.placeholder.com/50",
                        }}
                        style={{ width: 50, height: 50, borderRadius: 12 }}
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
                          {store.name}
                        </Text>
                        <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                          {store.category} · @{store.username}
                        </Text>
                      </View>
                      <TxIcon
                        name="chevronRight"
                        size={17}
                        color={COLORS.brand}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

            {/* Products */}
            {(activeTab === "all" || activeTab === "products") &&
              products.length > 0 && (
                <View>
                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 11,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      paddingHorizontal: 16,
                      paddingTop: 16,
                      paddingBottom: 8,
                    }}
                  >
                    Products
                  </Text>
                  {products.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      onPress={() =>
                        router.push(`/store/product/${product.id}`)
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: COLORS.borderLight,
                      }}
                    >
                      <ExpoImage
                        source={{
                          uri:
                            product.thumbnail_url ||
                            "https://via.placeholder.com/60",
                        }}
                        style={{ width: 60, height: 60, borderRadius: 10 }}
                        contentFit="cover"
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          style={{
                            color: COLORS.text,
                            fontSize: 14,
                            fontWeight: "600",
                          }}
                          numberOfLines={2}
                        >
                          {product.name}
                        </Text>
                        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                          {product.store_name}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: COLORS.brand,
                          fontSize: 16,
                          fontWeight: "800",
                        }}
                      >
                        ${parseFloat(product.price).toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
