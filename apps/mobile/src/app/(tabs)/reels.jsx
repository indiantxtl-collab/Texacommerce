import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Share,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoView, useVideoPlayer } from "expo-video";
import { router } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { COLORS, LOGO_URL, APP_NAME } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

function ReelItem({ item, isActive }) {
  const [liked, setLiked] = useState(item.user_liked || false);
  const [likeCount, setLikeCount] = useState(item.likes_count || 0);
  const [muted, setMuted] = useState(false);

  const player = useVideoPlayer(item.video_url, (p) => {
    p.loop = true;
    p.muted = false;
  });
  React.useEffect(() => {
    isActive ? player.play() : player.pause();
  }, [isActive]);
  React.useEffect(() => {
    player.muted = muted;
  }, [muted]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/reels/${item.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onMutate: () => {
      const wasLiked = liked;
      setLiked((l) => !l);
      setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    },
  });

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "#000",
      }}
    >
      <VideoView
        player={player}
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          position: "absolute",
        }}
        contentFit="cover"
        nativeControls={false}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 320,
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
        }}
      />

      {/* Header */}
      <View
        style={{
          position: "absolute",
          top: 54,
          left: 0,
          right: 0,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <ExpoImage
          source={{ uri: LOGO_URL }}
          style={{ width: 26, height: 26, borderRadius: 6 }}
          contentFit="contain"
        />
        <Text
          style={{
            color: "#fff",
            fontSize: 17,
            fontWeight: "800",
            marginLeft: 8,
            flex: 1,
          }}
        >
          {APP_NAME} Reels
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/create-reel")}
          style={{
            backgroundColor: COLORS.brand,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 7,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <TxIcon name="plus" size={15} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
            Create
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mute */}
      <TouchableOpacity
        onPress={() => setMuted((m) => !m)}
        style={{
          position: "absolute",
          top: 104,
          right: 16,
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: "rgba(0,0,0,0.45)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TxIcon name={muted ? "volumeOff" : "volume"} size={16} color="#fff" />
      </TouchableOpacity>

      {/* User Info */}
      <View style={{ position: "absolute", bottom: 90, left: 14, right: 70 }}>
        <TouchableOpacity
          onPress={() => router.push(`/user/${item.username}`)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <ExpoImage
            source={{
              uri: item.profile_picture || "https://via.placeholder.com/40",
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: "#fff",
            }}
            contentFit="cover"
          />
          <View style={{ marginLeft: 10 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                @{item.username}
              </Text>
              {item.verified && (
                <View
                  style={{
                    backgroundColor: COLORS.brand,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TxIcon name="check" size={9} color="#fff" />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
        {item.caption && (
          <Text
            style={{
              color: "#fff",
              fontSize: 13,
              lineHeight: 19,
              marginBottom: 8,
            }}
            numberOfLines={3}
          >
            {item.caption}
          </Text>
        )}
        {item.music_url && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <TxIcon name="music" size={13} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12 }}>Original Audio</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View
        style={{
          position: "absolute",
          right: 10,
          bottom: 90,
          alignItems: "center",
          gap: 18,
        }}
      >
        <TouchableOpacity
          onPress={() => likeMutation.mutate()}
          style={{ alignItems: "center" }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: liked ? COLORS.brand + "30" : "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TxIcon
              name={liked ? "heartFill" : "heart"}
              size={24}
              color={liked ? COLORS.brand : "#fff"}
            />
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 11,
              marginTop: 3,
              fontWeight: "600",
            }}
          >
            {likeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/reel/${item.id}/comments`)}
          style={{ alignItems: "center" }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TxIcon name="comment" size={24} color="#fff" />
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 11,
              marginTop: 3,
              fontWeight: "600",
            }}
          >
            {item.comments_count || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Share.share({ message: `Watch this reel on ${APP_NAME}!` })
          }
          style={{ alignItems: "center" }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TxIcon name="share" size={24} color="#fff" />
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 11,
              marginTop: 3,
              fontWeight: "600",
            }}
          >
            Share
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center" }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TxIcon name="bookmark" size={24} color="#fff" />
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 11,
              marginTop: 3,
              fontWeight: "600",
            }}
          >
            Save
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(`/user/${item.username}`)}>
          <ExpoImage
            source={{
              uri: item.profile_picture || "https://via.placeholder.com/40",
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 3,
              borderColor: COLORS.brand,
            }}
            contentFit="cover"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ReelsScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 });

  const { data: reelsData, isLoading } = useQuery({
    queryKey: ["reels"],
    queryFn: async () => {
      const res = await fetch("/api/reels");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index || 0);
  }, []);

  const reels = reelsData?.reels || [];

  if (isLoading)
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
        <ActivityIndicator color={COLORS.brand} size="large" />
      </View>
    );

  if (reels.length === 0)
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
        <Text
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          No Reels Yet
        </Text>
        <Text style={{ color: "#999", marginBottom: 24 }}>
          Be the first to post a reel!
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/create-reel")}
          style={{
            backgroundColor: COLORS.brand,
            borderRadius: 12,
            paddingHorizontal: 24,
            paddingVertical: 13,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Create Reel
          </Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />
      <FlatList
        data={reels}
        renderItem={({ item, index }) => (
          <ReelItem item={item} isActive={index === activeIndex} />
        )}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
}
