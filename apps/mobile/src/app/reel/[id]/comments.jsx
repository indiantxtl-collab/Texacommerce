import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import useUser from "@/utils/auth/useUser";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { COLORS, SHADOW } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function ReelCommentsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [comment, setComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const { data: authUser } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const { data, isLoading } = useQuery({
    queryKey: ["reel-comments", id],
    queryFn: async () => {
      const res = await fetch(`/api/reels/${id}/comments`);
      if (!res.ok) return { comments: [] };
      return res.json();
    },
    refetchInterval: 5000,
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!comment.trim()) throw new Error("Comment cannot be empty");
      const res = await fetch(`/api/reels/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          comment: comment.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return res.json();
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries(["reel-comments", id]);
    },
  });

  const comments = data?.comments || [];

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
    >
      <StatusBar style="dark" />
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <TxIcon name="back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.text }}>
            Comments ({comments.length})
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator color={COLORS.brand} />
          </View>
        ) : comments.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: COLORS.brand + "10",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <TxIcon name="comment" size={30} color={COLORS.brand} />
            </View>
            <Text
              style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}
            >
              No comments yet
            </Text>
            <Text style={{ color: COLORS.textSecondary, marginTop: 4 }}>
              Be the first to comment!
            </Text>
          </View>
        ) : (
          comments.map((c) => (
            <View key={c.id} style={{ flexDirection: "row", gap: 12 }}>
              <ExpoImage
                source={{
                  uri: c.profile_picture || "https://via.placeholder.com/40",
                }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                contentFit="cover"
              />
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    backgroundColor: COLORS.bgSecondary,
                    borderRadius: 16,
                    padding: 12,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.brand,
                      fontSize: 13,
                      fontWeight: "700",
                      marginBottom: 4,
                    }}
                  >
                    @{c.username}
                  </Text>
                  <Text
                    style={{ color: COLORS.text, fontSize: 14, lineHeight: 20 }}
                  >
                    {c.comment}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                    marginTop: 6,
                    paddingLeft: 4,
                  }}
                >
                  <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                    {new Date(c.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <TxIcon name="heart" size={13} color={COLORS.textMuted} />
                    <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                      Like
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text
                      style={{
                        color: COLORS.brand,
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      Reply
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Comment Input */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: insets.bottom + 12,
          backgroundColor: COLORS.bg,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Add a comment..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={300}
          style={{
            flex: 1,
            backgroundColor: COLORS.bgSecondary,
            borderRadius: 22,
            paddingHorizontal: 16,
            paddingVertical: 10,
            color: COLORS.text,
            fontSize: 14,
            maxHeight: 100,
          }}
        />
        <TouchableOpacity
          onPress={() => addCommentMutation.mutate()}
          disabled={!comment.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: comment.trim() ? COLORS.brand : COLORS.bgSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TxIcon
            name="send"
            size={17}
            color={comment.trim() ? "#fff" : COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
