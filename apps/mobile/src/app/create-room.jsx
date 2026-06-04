import React, { useState } from "react";
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
import { TxIcon } from "@/components/SvgIcons";

export default function CreateRoomScreen() {
  const insets = useSafeAreaInsets();
  const [roomName, setRoomName] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { uploadFile } = useUpload();

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setCoverImage(result.assets[0].uri);
  };

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      if (!roomName.trim()) throw new Error("Please enter a room name");
      setIsUploading(true);
      let uploadedCoverUrl = null;
      if (coverImage) uploadedCoverUrl = await uploadFile(coverImage);
      const res = await fetch("/api/voice-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName.trim(),
          cover_image: uploadedCoverUrl,
        }),
      });
      setIsUploading(false);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["voice-rooms"]);
      Alert.alert("🎙 Room Created!", "Your voice room is now live!", [
        {
          text: "Enter Room",
          onPress: () => router.replace(`/room/${data.room.id}`),
        },
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
            Create Voice Room
          </Text>
          <TouchableOpacity
            onPress={() => createRoomMutation.mutate()}
            disabled={!roomName.trim() || isUploading}
          >
            <Text
              style={{
                color: roomName.trim() ? COLORS.brand : COLORS.textMuted,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {isUploading ? "Creating..." : "Create"}
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
        {/* Room Name */}
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
              color: COLORS.textSecondary,
              fontSize: 13,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Room Name *
          </Text>
          <TextInput
            value={roomName}
            onChangeText={setRoomName}
            placeholder="Enter room name..."
            placeholderTextColor={COLORS.textMuted}
            maxLength={50}
            style={{
              backgroundColor: COLORS.bgSecondary,
              borderRadius: 10,
              padding: 14,
              color: COLORS.text,
              fontSize: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
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
            {roomName.length}/50
          </Text>
        </View>

        {/* Cover Image */}
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
              color: COLORS.textSecondary,
              fontSize: 13,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Cover Image (Optional)
          </Text>
          {coverImage ? (
            <View>
              <ExpoImage
                source={{ uri: coverImage }}
                style={{ width: "100%", height: 200, borderRadius: 12 }}
                contentFit="cover"
              />
              <TouchableOpacity
                onPress={() => setCoverImage(null)}
                style={{
                  marginTop: 10,
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  backgroundColor: COLORS.bgSecondary,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={pickCoverImage}
              style={{
                backgroundColor: COLORS.bgSecondary,
                borderRadius: 12,
                padding: 36,
                alignItems: "center",
                borderWidth: 2,
                borderColor: COLORS.border,
                borderStyle: "dashed",
              }}
            >
              <TxIcon name="image" size={40} color={COLORS.textMuted} />
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 14,
                  marginTop: 10,
                }}
              >
                Add cover image
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Box */}
        <View
          style={{
            backgroundColor: COLORS.brand + "08",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: COLORS.brand + "30",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <TxIcon name="mic" size={18} color={COLORS.brand} />
            <Text
              style={{ color: COLORS.brand, fontSize: 14, fontWeight: "700" }}
            >
              Room Info
            </Text>
          </View>
          {[
            "Up to 8 participants can join your voice room",
            "You'll be the host and admin",
            "Control who can speak and manage the room",
            "Participants can send you gifts",
          ].map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <Text style={{ color: COLORS.brand, fontSize: 12 }}>•</Text>
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 13,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => createRoomMutation.mutate()}
          disabled={
            !roomName.trim() || isUploading || createRoomMutation.isPending
          }
          style={{
            backgroundColor: roomName.trim() ? COLORS.brand : COLORS.textLight,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {isUploading || createRoomMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <TxIcon name="mic" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
                Go Live
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
