import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Store,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useUpload } from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import useUser from "@/utils/auth/useUser";
import { COLORS, SHADOW } from "@/constants/theme";

const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Beauty",
  "Food",
  "Sports",
  "Home",
  "Books",
  "Toys",
  "Art",
  "Health",
  "Other",
];

export default function CreateStoreScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUri, setLogoUri] = useState(null);
  const [bannerUri, setBannerUri] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { uploadFile } = useUpload();

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Store name is required");
      if (!category) throw new Error("Please select a category");
      setIsUploading(true);

      let logoUrl = null,
        bannerUrl = null;
      if (logoUri) logoUrl = await uploadFile(logoUri);
      if (bannerUri) bannerUrl = await uploadFile(bannerUri);

      setIsUploading(false);

      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          name: name.trim(),
          description: description.trim() || null,
          category,
          logo_url: logoUrl,
          banner_url: bannerUrl,
          location: location.trim() || null,
          phone: phone.trim() || null,
          website: website.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create store");
      }
      return res.json();
    },
    onSuccess: (data) => {
      Alert.alert("🎉 Store Created!", "Your store is now live!", [
        {
          text: "Go to Store",
          onPress: () => router.replace(`/store/${data.store.id}`),
        },
      ]);
    },
    onError: (e) => Alert.alert("Error", e.message),
  });

  const generateDescription = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Tip",
        "Enter your store name first for better AI suggestions!",
      );
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product-description",
          context: { productName: name, category: category || "general" },
        }),
      });
      const data = await res.json();
      if (data.result) setDescription(data.result);
    } catch {}
    setAiLoading(false);
  };

  const pickImage = async (type) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "logo" ? [1, 1] : [16, 9],
      quality: 0.8,
    });
    if (!res.canceled) {
      if (type === "logo") setLogoUri(res.assets[0].uri);
      else setBannerUri(res.assets[0].uri);
    }
  };

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.text }}>
            Open Your Store
          </Text>
          <TouchableOpacity
            onPress={() => createMutation.mutate()}
            disabled={!name.trim() || isUploading || createMutation.isPending}
          >
            <Text
              style={{
                color: name.trim() ? COLORS.brand : COLORS.textMuted,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <TouchableOpacity
          onPress={() => pickImage("banner")}
          style={{
            height: 140,
            backgroundColor: COLORS.bg,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: COLORS.border,
            borderStyle: "dashed",
            overflow: "hidden",
          }}
        >
          {bannerUri ? (
            <Image
              source={{ uri: bannerUri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ alignItems: "center", gap: 8 }}>
              <ImageIcon size={32} color={COLORS.textMuted} />
              <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                Add Store Banner
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Logo + Name */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 16,
            padding: 16,
            ...SHADOW.sm,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}
          >
            <TouchableOpacity
              onPress={() => pickImage("logo")}
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                backgroundColor: COLORS.bgSecondary,
                borderWidth: 2,
                borderColor: COLORS.border,
                borderStyle: "dashed",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {logoUri ? (
                <Image
                  source={{ uri: logoUri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <Store size={28} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                Store Name *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your store name"
                placeholderTextColor={COLORS.textMuted}
                maxLength={50}
                style={{
                  backgroundColor: COLORS.bgSecondary,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: COLORS.text,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              />
            </View>
          </View>
        </View>

        {/* Description */}
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
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text
              style={{ color: COLORS.text, fontSize: 15, fontWeight: "700" }}
            >
              Description
            </Text>
            <TouchableOpacity
              onPress={generateDescription}
              disabled={aiLoading}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: COLORS.brand + "15",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Sparkles size={14} color={COLORS.brand} />
              <Text
                style={{ color: COLORS.brand, fontSize: 12, fontWeight: "700" }}
              >
                {aiLoading ? "Generating..." : "AI Write"}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your store..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={300}
            style={{
              backgroundColor: COLORS.bgSecondary,
              borderRadius: 10,
              padding: 12,
              color: COLORS.text,
              fontSize: 14,
              minHeight: 100,
              textAlignVertical: "top",
            }}
          />
        </View>

        {/* Category */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 16,
            padding: 16,
            ...SHADOW.sm,
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontSize: 15,
              fontWeight: "700",
              marginBottom: 12,
            }}
          >
            Category *
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: category === cat ? COLORS.brand : COLORS.border,
                  backgroundColor:
                    category === cat ? COLORS.brand + "15" : COLORS.bg,
                }}
              >
                <Text
                  style={{
                    color:
                      category === cat ? COLORS.brand : COLORS.textSecondary,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 16,
            padding: 16,
            ...SHADOW.sm,
            gap: 12,
          }}
        >
          <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: "700" }}>
            Contact & Location
          </Text>
          {[
            {
              label: "Location",
              value: location,
              setter: setLocation,
              placeholder: "City, Country",
            },
            {
              label: "Phone",
              value: phone,
              setter: setPhone,
              placeholder: "Store phone number",
              keyboard: "phone-pad",
            },
            {
              label: "Website",
              value: website,
              setter: setWebsite,
              placeholder: "https://yoursite.com",
              keyboard: "url",
            },
          ].map(({ label, value, setter, placeholder, keyboard }) => (
            <View key={label}>
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 12,
                  marginBottom: 6,
                }}
              >
                {label}
              </Text>
              <TextInput
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textMuted}
                keyboardType={keyboard}
                style={{
                  backgroundColor: COLORS.bgSecondary,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: COLORS.text,
                  fontSize: 14,
                }}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => createMutation.mutate()}
          disabled={
            !name.trim() || !category || createMutation.isPending || isUploading
          }
          style={{
            backgroundColor:
              name.trim() && category ? COLORS.brand : COLORS.textLight,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          {createMutation.isPending || isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
              Create Store 🚀
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
