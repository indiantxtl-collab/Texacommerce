import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Keyboard,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import * as ImagePicker from "expo-image-picker";
import { useUpload } from "@/utils/useUpload";
import { Image as ExpoImage } from "expo-image";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { COLORS, SHADOW } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function ChatConversationScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);
  const typingTimeout = useRef(null);
  const { data: authUser } = useUser();
  const queryClient = useQueryClient();
  const { uploadFile } = useUpload();

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const { data: conversationData } = useQuery({
    queryKey: ["conversation", userId, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { messages: [], otherUser: null };
      const res = await fetch(
        `/api/messages/conversation?userId=${currentUserId}&otherUserId=${userId}`,
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!currentUserId,
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ messageText, imageUrl }) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: parseInt(userId),
          message: messageText || null,
          image_url: imageUrl || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversation"]);
      queryClient.invalidateQueries(["conversations"]);
      setMessage("");
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    },
  });

  const handleTextChange = (text) => {
    setMessage(text);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {}, 1500);
  };

  const handleSend = () => {
    if (message.trim())
      sendMessageMutation.mutate({ messageText: message.trim() });
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const imageUrl = await uploadFile(result.assets[0].uri);
      sendMessageMutation.mutate({ imageUrl });
    }
  };

  const messages = conversationData?.messages || [];
  const otherUser = conversationData?.otherUser;

  useEffect(() => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      150,
    );
  }, [messages.length]);

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today - 86400000);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (!otherUser)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar style="dark" />
        <Text style={{ color: COLORS.textMuted }}>Loading...</Text>
      </View>
    );

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 12,
          paddingBottom: 10,
          backgroundColor: COLORS.bg,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <TxIcon name="back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/user/${otherUser.username}`)}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View style={{ position: "relative" }}>
            <ExpoImage
              source={{
                uri:
                  otherUser.profile_picture || "https://via.placeholder.com/42",
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                borderWidth: 2,
                borderColor: otherUser.verified ? COLORS.brand : "transparent",
              }}
              contentFit="cover"
            />
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 11,
                height: 11,
                borderRadius: 6,
                backgroundColor: COLORS.success,
                borderWidth: 2,
                borderColor: COLORS.bg,
              }}
            />
          </View>
          <View>
            <Text
              style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}
            >
              {otherUser.full_name}
            </Text>
            <Text style={{ color: COLORS.success, fontSize: 12 }}>Online</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/call/voice/${userId}`)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: COLORS.bgSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TxIcon name="phone" size={17} color={COLORS.brand} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/call/video/${userId}`)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: COLORS.bgSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TxIcon name="video" size={17} color={COLORS.brandSecondary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, backgroundColor: COLORS.bgSecondary }}
        contentContainerStyle={{
          padding: 12,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedMessages).map(([date, dayMsgs]) => (
          <View key={date}>
            {/* Date separator */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 12,
                gap: 10,
              }}
            >
              <View
                style={{ flex: 1, height: 1, backgroundColor: COLORS.border }}
              />
              <Text
                style={{
                  color: COLORS.textMuted,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {date}
              </Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: COLORS.border }}
              />
            </View>

            {dayMsgs.map((msg, idx) => {
              const isMe = msg.sender_id === currentUserId;
              const showAvatar =
                !isMe &&
                (idx === 0 || dayMsgs[idx - 1]?.sender_id !== msg.sender_id);

              return (
                <View
                  key={msg.id}
                  style={{
                    flexDirection: isMe ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    marginBottom: 4,
                    gap: 6,
                  }}
                >
                  {!isMe &&
                    (showAvatar ? (
                      <ExpoImage
                        source={{
                          uri:
                            otherUser.profile_picture ||
                            "https://via.placeholder.com/28",
                        }}
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={{ width: 28 }} />
                    ))}

                  <View style={{ maxWidth: "72%" }}>
                    {msg.image_url && (
                      <ExpoImage
                        source={{ uri: msg.image_url }}
                        style={{
                          width: 200,
                          height: 200,
                          borderRadius: 16,
                          marginBottom: msg.message ? 4 : 0,
                        }}
                        contentFit="cover"
                      />
                    )}
                    {msg.message && (
                      <View
                        style={{
                          backgroundColor: isMe ? COLORS.brand : COLORS.bg,
                          borderRadius: 18,
                          borderBottomRightRadius: isMe ? 4 : 18,
                          borderBottomLeftRadius: isMe ? 18 : 4,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          ...(!isMe && {
                            borderWidth: 1,
                            borderColor: COLORS.border,
                          }),
                          ...SHADOW.sm,
                        }}
                      >
                        <Text
                          style={{
                            color: isMe ? "#fff" : COLORS.text,
                            fontSize: 15,
                            lineHeight: 21,
                          }}
                        >
                          {msg.message}
                        </Text>
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: isMe ? "row-reverse" : "row",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 3,
                        paddingHorizontal: 4,
                      }}
                    >
                      <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
                        {formatTime(msg.created_at)}
                      </Text>
                      {isMe &&
                        (msg.seen_at ? (
                          <TxIcon
                            name="checkDouble"
                            size={12}
                            color={COLORS.brand}
                          />
                        ) : (
                          <TxIcon
                            name="check"
                            size={12}
                            color={COLORS.textMuted}
                          />
                        ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Typing Indicator */}
        {conversationData?.otherTyping && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
            }}
          >
            <ExpoImage
              source={{ uri: otherUser.profile_picture }}
              style={{ width: 28, height: 28, borderRadius: 14 }}
              contentFit="cover"
            />
            <View
              style={{
                backgroundColor: COLORS.bg,
                borderRadius: 18,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <View style={{ flexDirection: "row", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: COLORS.textMuted,
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          paddingBottom: insets.bottom + 10,
          backgroundColor: COLORS.bg,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        <TouchableOpacity
          onPress={handlePickImage}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: COLORS.bgSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TxIcon name="image" size={18} color={COLORS.brand} />
        </TouchableOpacity>

        <TextInput
          value={message}
          onChangeText={handleTextChange}
          placeholder="Message..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={1000}
          style={{
            flex: 1,
            backgroundColor: COLORS.bgSecondary,
            borderRadius: 22,
            paddingHorizontal: 16,
            paddingVertical: 10,
            color: COLORS.text,
            fontSize: 15,
            maxHeight: 120,
            lineHeight: 21,
          }}
        />

        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: message.trim() ? COLORS.brand : COLORS.bgSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TxIcon
            name="send"
            size={18}
            color={message.trim() ? "#fff" : COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
