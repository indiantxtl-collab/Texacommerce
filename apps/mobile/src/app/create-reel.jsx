import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Upload,
  VideoIcon,
  Music,
  Sparkles,
  Hash,
  Lightbulb,
} from "lucide-react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUpload } from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { VideoView, useVideoPlayer } from "expo-video";
import { COLORS, SHADOW } from "@/constants/theme";
import useUser from "@/utils/auth/useUser";

function VideoPreview({ uri }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });
  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: "100%" }}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

export default function CreateReelScreen() {
  const insets = useSafeAreaInsets();
  const [videoUri, setVideoUri] = useState(null);
  const [caption, setCaption] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiType, setAiType] = useState(null);
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

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setVideoUri(result.assets[0].uri);
  };

  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission required");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });
    if (!result.canceled) setVideoUri(result.assets[0].uri);
  };

  const getAiSuggestion = async (type) => {
    setAiLoading(true);
    setAiType(type);
    setAiSuggestions(null);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          context: {
            description: caption || "lifestyle content",
            mediaType: "video reel",
          },
        }),
      });
      const data = await res.json();
      if (data.result)
        setAiSuggestions(
          Array.isArray(data.result) ? data.result : [data.result],
        );
    } catch (e) {
      Alert.alert("AI Error", "Could not generate suggestions. Try again.");
    }
    setAiLoading(false);
  };

  const createReelMutation = useMutation({
    mutationFn: async () => {
      if (!videoUri) throw new Error("Please select a video");
      if (!currentUserId) throw new Error("Please sign in first");
      setIsUploading(true);
      const uploadedVideoUrl = await uploadFile(videoUri);
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          video_url: uploadedVideoUrl,
          caption: caption.trim() || null,
          music_url: musicUrl.trim() || null,
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
      queryClient.invalidateQueries(["reels"]);
      Alert.alert("🎉 Reel Posted!", "", [
        { text: "View Reels", onPress: () => router.push("/(tabs)/reels") },
      ]);
    },
    onError: (e) => Alert.alert("Error", e.message),
  });

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: COLORS.bgSecondary }}
    >
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
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.text }}>
            Create Reel ✨
          </Text>
          <TouchableOpacity
            onPress={() => createReelMutation.mutate()}
            disabled={!videoUri || isUploading || createReelMutation.isPending}
          >
            <Text
              style={{
                color:
                  videoUri && !isUploading ? COLORS.brand : COLORS.textMuted,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {isUploading ? "Uploading..." : "Post"}
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
        {/* Video Picker */}
        {!videoUri ? (
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
              <VideoIcon size={32} color={COLORS.brand} />
            </View>
            <Text
              style={{ color: COLORS.text, fontSize: 18, fontWeight: "700" }}
            >
              Choose Your Video
            </Text>
            <Text style={{ color: COLORS.textSecondary, textAlign: "center" }}>
              Record a new video or choose from your library
            </Text>
            <View style={{ gap: 10, width: "100%", marginTop: 8 }}>
              <TouchableOpacity
                onPress={recordVideo}
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
                <VideoIcon size={18} color="#fff" />
                <Text
                  style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}
                >
                  Record Video
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
                <Upload size={18} color={COLORS.text} />
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Choose from Library
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: COLORS.bg,
              borderRadius: 16,
              overflow: "hidden",
              ...SHADOW.sm,
            }}
          >
            <View style={{ height: 320, borderRadius: 16, overflow: "hidden" }}>
              <VideoPreview uri={videoUri} />
            </View>
            <View style={{ padding: 14 }}>
              <TouchableOpacity
                onPress={() => setVideoUri(null)}
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
                  Change Video
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Caption with AI */}
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
              Caption
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => getAiSuggestion("caption")}
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
                <Sparkles size={13} color={COLORS.brand} />
                <Text
                  style={{
                    color: COLORS.brand,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  AI Caption
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => getAiSuggestion("hashtags")}
                disabled={aiLoading}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: COLORS.brandSecondary + "15",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Hash size={13} color={COLORS.brandSecondary} />
                <Text
                  style={{
                    color: COLORS.brandSecondary,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  Tags
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption or use AI..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={200}
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
            {caption.length}/200
          </Text>

          {/* AI Suggestions */}
          {aiLoading && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
                padding: 12,
                backgroundColor: COLORS.bgSecondary,
                borderRadius: 10,
              }}
            >
              <ActivityIndicator size="small" color={COLORS.brand} />
              <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                AI is thinking...
              </Text>
            </View>
          )}

          {aiSuggestions && !aiLoading && (
            <View style={{ marginTop: 12 }}>
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                {aiType === "caption"
                  ? "✨ AI Caption Suggestions"
                  : "# Hashtag Suggestions"}
              </Text>
              {aiSuggestions.map((suggestion, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    if (aiType === "hashtags") {
                      setCaption(
                        (c) =>
                          c +
                          (c ? " " : "") +
                          (Array.isArray(suggestion)
                            ? suggestion.join(" ")
                            : suggestion),
                      );
                    } else {
                      setCaption(suggestion);
                    }
                    setAiSuggestions(null);
                  }}
                  style={{
                    backgroundColor: COLORS.brand + "10",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 6,
                    borderWidth: 1,
                    borderColor: COLORS.brand + "30",
                  }}
                >
                  <Text style={{ color: COLORS.text, fontSize: 13 }}>
                    {typeof suggestion === "object"
                      ? JSON.stringify(suggestion)
                      : suggestion}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.brand,
                      fontSize: 11,
                      marginTop: 4,
                      fontWeight: "600",
                    }}
                  >
                    Tap to use →
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* AI Content Ideas */}
        <TouchableOpacity
          onPress={() => getAiSuggestion("reel-idea")}
          disabled={aiLoading}
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            ...SHADOW.sm,
            borderWidth: 1,
            borderColor: COLORS.brand + "20",
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: COLORS.brandPink + "15",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lightbulb size={22} color={COLORS.brandPink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: COLORS.text, fontSize: 15, fontWeight: "700" }}
            >
              AI Content Ideas
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
              Get viral reel ideas powered by AI
            </Text>
          </View>
          <Sparkles size={20} color={COLORS.brand} />
        </TouchableOpacity>

        {/* Music */}
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
              marginBottom: 10,
            }}
          >
            Music (Optional)
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.bgSecondary,
              borderRadius: 10,
              paddingHorizontal: 12,
            }}
          >
            <Music size={18} color={COLORS.textMuted} />
            <TextInput
              value={musicUrl}
              onChangeText={setMusicUrl}
              placeholder="Add music URL..."
              placeholderTextColor={COLORS.textMuted}
              style={{
                flex: 1,
                color: COLORS.text,
                fontSize: 14,
                paddingVertical: 12,
                paddingLeft: 10,
              }}
            />
          </View>
        </View>

        {/* Post Button */}
        <TouchableOpacity
          onPress={() => createReelMutation.mutate()}
          disabled={!videoUri || isUploading || createReelMutation.isPending}
          style={{
            backgroundColor: videoUri ? COLORS.brand : COLORS.textLight,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          {isUploading || createReelMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
              🚀 Post Reel
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
