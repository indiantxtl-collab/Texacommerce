import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoView, useVideoPlayer } from "expo-video";
import { Image as ExpoImage } from "expo-image";
import { COLORS } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

// Video story component to properly use hooks
function VideoStory({ uri }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={{ width, height, position: "absolute" }}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

export default function StoryViewerScreen() {
  const { userId } = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const queryClient = useQueryClient();

  const { data: storiesData } = useQuery({
    queryKey: ["user-stories", userId],
    queryFn: async () => {
      const res = await fetch(`/api/stories?userId=${userId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const viewMutation = useMutation({
    mutationFn: async (storyId) => {
      const res = await fetch(`/api/stories/${storyId}/view`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const reactMutation = useMutation({
    mutationFn: async ({ storyId, reaction }) => {
      const res = await fetch(`/api/stories/${storyId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const stories = storiesData?.stories || [];
  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (currentStory) {
      viewMutation.mutate(currentStory.id);
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) goToNext();
      });
    }
    return () => progressAnim.stopAnimation();
  }, [currentIndex, currentStory?.id]);

  const goToNext = () => {
    if (currentIndex < stories.length - 1) setCurrentIndex(currentIndex + 1);
    else router.back();
  };

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    else router.back();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) goToPrevious();
        else if (gestureState.dx < -50) goToNext();
      },
    }),
  ).current;

  if (!currentStory)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar style="light" />
        <Text style={{ color: "#fff" }}>Loading stories...</Text>
      </View>
    );

  return (
    <View
      style={{ flex: 1, backgroundColor: "#000" }}
      {...panResponder.panHandlers}
    >
      <StatusBar style="light" />

      {/* Story Media */}
      {currentStory.media_type === "image" ? (
        <ExpoImage
          source={{ uri: currentStory.media_url }}
          style={{ width, height, position: "absolute" }}
          contentFit="cover"
        />
      ) : (
        <VideoStory uri={currentStory.media_url} />
      )}

      {/* Gradient */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)",
        }}
      />

      {/* Progress Bars */}
      <View
        style={{
          flexDirection: "row",
          gap: 4,
          paddingHorizontal: 8,
          paddingTop: 50,
        }}
      >
        {stories.map((_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 3,
              backgroundColor: "rgba(255,255,255,0.3)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {index === currentIndex && (
              <Animated.View
                style={{
                  height: "100%",
                  backgroundColor: "#fff",
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                }}
              />
            )}
            {index < currentIndex && (
              <View
                style={{
                  height: "100%",
                  backgroundColor: "#fff",
                  width: "100%",
                }}
              />
            )}
          </View>
        ))}
      </View>

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <ExpoImage
            source={{
              uri:
                currentStory.user?.profile_picture ||
                "https://via.placeholder.com/40",
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: COLORS.brand,
            }}
            contentFit="cover"
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              {currentStory.user?.full_name || "Unknown"}
            </Text>
            <Text style={{ color: "#ccc", fontSize: 12 }}>
              {new Date(currentStory.created_at).toLocaleTimeString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {currentStory.caption && (
        <View
          style={{
            position: "absolute",
            bottom: 110,
            left: 16,
            right: 16,
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 15, textAlign: "center" }}>
            {currentStory.caption}
          </Text>
        </View>
      )}

      {/* Reactions */}
      <View
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {["❤️", "🔥", "😂", "😮", "👏"].map((emoji) => (
          <TouchableOpacity
            key={emoji}
            onPress={() =>
              reactMutation.mutate({
                storyId: currentStory.id,
                reaction: emoji,
              })
            }
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(0,0,0,0.5)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 22 }}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tap Zones */}
      <TouchableOpacity
        onPress={goToPrevious}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: width / 3,
        }}
      />
      <TouchableOpacity
        onPress={goToNext}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: width / 3,
        }}
      />
    </View>
  );
}
