import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUpload } from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { Image as ExpoImage } from "expo-image";
import { COLORS, SHADOW } from "@/constants/theme";
import useUser from "@/utils/auth/useUser";
import { TxIcon } from "@/components/SvgIcons";

export default function CreateStoryScreen() {
  const insets = useSafeAreaInsets();
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const queryClient = useQueryClient();
  const { uploadFile } = useUpload();
  const { data: authUser } = useUser();

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });
    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
      setMediaType("image");
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
      setMediaType("video");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission required");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });
    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
      setMediaType("image");
    }
  };

  const generateCaption = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "caption",
          context: {
            description: "story moment",
            mediaType: mediaType || "photo",
          },
        }),
      });
      const data = await res.json();
      if (data.result && Array.isArray(data.result) && data.result.length > 0) {
        setCaption(data.result[0]);
      }
    } catch {}
    setAiLoading(false);
  };

  const createStoryMutation = useMutation({
    mutationFn: async () => {
      if (!mediaUri) throw new Error("Please select media");
      if (!currentUserId) throw new Error("Please sign in first");
      setIsUploading(true);
      const mediaUrl = await uploadFile(mediaUri);
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          media_url: mediaUrl,
          media_type: mediaType,
          caption: caption.trim() || null,
        }),
      });
      setIsUploading(false);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stories"]);
      Alert.alert("Story Posted!", "Your story is now live for 24 hours.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (e) => Alert.alert("Error", e.message),
  });

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
            <TxIcon name="back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.text }}>
            Create Story
          </Text>
          <TouchableOpacity
            onPress={() => createStoryMutation.mutate()}
            disabled={!mediaUri || isUploading}
          >
            <Text
              style={{
                color: mediaUri ? COLORS.brand : COLORS.textMuted,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {isUploading ? "Posting..." : "Post"}
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
        {/* Media Preview or Picker */}
        {mediaUri ? (
          <View
            style={{
              backgroundColor: COLORS.bg,
              borderRadius: 20,
              overflow: "hidden",
              ...SHADOW.md,
            }}
          >
            <ExpoImage
              source={{ uri: mediaUri }}
              style={{ width: "100%", aspectRatio: 9 / 16, maxHeight: 450 }}
              contentFit="cover"
            />
            <View style={{ padding: 14 }}>
              <TouchableOpacity
                onPress={() => {
                  setMediaUri(null);
                  setMediaType(null);
                }}
                style={{
                  backgroundColor: COLORS.bgSecondary,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Change Media
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: COLORS.bg,
              borderRadius: 20,
              padding: 32,
              alignItems: "center",
              gap: 16,
              ...SHADOW.sm,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: COLORS.brand + "15",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TxIcon name="camera" size={32} color={COLORS.brand} />
            </View>
            <Text
              style={{ color: COLORS.text, fontSize: 18, fontWeight: "700" }}
            >
              Share a Moment
            </Text>
            <Text style={{ color: COLORS.textSecondary, textAlign: "center" }}>
              Stories disappear after 24 hours
            </Text>
            <View style={{ gap: 10, width: "100%", marginTop: 8 }}>
              <TouchableOpacity
                onPress={takePhoto}
                style={{
                  backgroundColor: COLORS.brand,
                  borderRadius: 12,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <TxIcon name="camera" size={18} color="#fff" />
                <Text
                  style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}
                >
                  Take Photo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  backgroundColor: COLORS.bgSecondary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <TxIcon name="image" size={18} color={COLORS.text} />
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Choose Photo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickVideo}
                style={{
                  backgroundColor: COLORS.bgSecondary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <TxIcon name="video" size={18} color={COLORS.text} />
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Choose Video
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Caption */}
        {mediaUri && (
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
                Caption (Optional)
              </Text>
              <TouchableOpacity
                onPress={generateCaption}
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
                <TxIcon name="sparkle" size={13} color={COLORS.brand} />
                <Text
                  style={{
                    color: COLORS.brand,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {aiLoading ? "..." : "AI Write"}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Add a caption..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={150}
              style={{
                backgroundColor: COLORS.bgSecondary,
                borderRadius: 10,
                padding: 12,
                color: COLORS.text,
                fontSize: 14,
                minHeight: 80,
                textAlignVertical: "top",
              }}
            />
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: 11,
                marginTop: 6,
                textAlign: "right",
              }}
            >
              {caption.length}/150
            </Text>
          </View>
        )}

        {mediaUri && (
          <TouchableOpacity
            onPress={() => createStoryMutation.mutate()}
            disabled={isUploading || createStoryMutation.isPending}
            style={{
              backgroundColor: COLORS.brand,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            {isUploading || createStoryMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
                Share Story
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
