import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Hand,
  Gift,
  Users,
  Music,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { Image as ExpoImage } from "expo-image";
import { COLORS, SHADOW } from "@/constants/theme";

export default function VoiceRoomScreen() {
  const insets = useSafeAreaInsets();
  const { roomId } = useLocalSearchParams();
  const [currentUserId, setCurrentUserId] = useState(null);
  const { data: authUser } = useUser();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const { data: roomData } = useQuery({
    queryKey: ["voice-room", roomId],
    queryFn: async () => {
      const res = await fetch(`/api/voice-rooms/${roomId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 3000,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/voice-rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["voice-room"]),
    onError: (e) => Alert.alert("Error", e.message),
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/voice-rooms/${roomId}/join`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["voice-room"]);
      router.back();
    },
  });

  const room = roomData?.room;
  const participants = roomData?.participants || [];
  const isParticipant = participants.some((p) => p.user_id === currentUserId);
  const seats = Array.from({ length: 8 }, (_, i) => ({
    seatNumber: i + 1,
    participant: participants.find((p) => p.seat_number === i + 1),
  }));

  if (!room)
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
        <Text style={{ color: COLORS.textMuted }}>Loading room...</Text>
      </View>
    );

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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: COLORS.text, fontSize: 20, fontWeight: "700" }}
            >
              {room.name}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 2,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.success,
                }}
              />
              <Text
                style={{
                  color: COLORS.success,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                LIVE
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                · {participants.length} joined
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {room.cover_image && (
          <ExpoImage
            source={{ uri: room.cover_image }}
            style={{ width: "100%", height: 180 }}
            contentFit="cover"
          />
        )}

        {/* Host */}
        <View
          style={{
            padding: 16,
            backgroundColor: COLORS.bg,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
        >
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: 11,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            HOST
          </Text>
          {room.host && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ExpoImage
                source={{
                  uri:
                    room.host.profile_picture ||
                    "https://via.placeholder.com/48",
                }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 2.5,
                  borderColor: COLORS.gold,
                }}
                contentFit="cover"
              />
              <View style={{ marginLeft: 12 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {room.host.full_name}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                  @{room.host.username}
                </Text>
              </View>
              <View
                style={{
                  marginLeft: "auto",
                  backgroundColor: COLORS.gold + "15",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{
                    color: COLORS.gold,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  👑 Host
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Seats Grid */}
        <View style={{ padding: 16 }}>
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: 11,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 14,
            }}
          >
            SPEAKERS ({participants.length}/8)
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {seats.map((seat) => (
              <View
                key={seat.seatNumber}
                style={{
                  width: "22%",
                  aspectRatio: 0.85,
                  backgroundColor: seat.participant
                    ? COLORS.bg
                    : COLORS.bgSecondary,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: seat.participant?.is_admin
                    ? COLORS.gold
                    : seat.participant
                      ? COLORS.brand + "30"
                      : COLORS.border,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 8,
                  ...SHADOW.sm,
                }}
              >
                {seat.participant ? (
                  <>
                    <ExpoImage
                      source={{
                        uri:
                          seat.participant.user?.profile_picture ||
                          "https://via.placeholder.com/50",
                      }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        marginBottom: 5,
                      }}
                      contentFit="cover"
                    />
                    <Text
                      style={{
                        color: COLORS.text,
                        fontSize: 11,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                      numberOfLines={1}
                    >
                      {seat.participant.user?.username || "User"}
                    </Text>
                    {seat.participant.is_muted ? (
                      <MicOff size={14} color={COLORS.textMuted} />
                    ) : (
                      <Mic size={14} color={COLORS.brand} />
                    )}
                    {seat.participant.hand_raised && (
                      <Hand
                        size={14}
                        color={COLORS.gold}
                        style={{ position: "absolute", top: 6, right: 6 }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: COLORS.bg,
                        borderWidth: 2,
                        borderColor: COLORS.border,
                        borderStyle: "dashed",
                        marginBottom: 5,
                      }}
                    />
                    <Text style={{ color: COLORS.textLight, fontSize: 11 }}>
                      Empty
                    </Text>
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {room.current_song && (
          <View
            style={{
              margin: 16,
              padding: 16,
              backgroundColor: COLORS.bg,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: COLORS.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: COLORS.brand + "15",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Music size={20} color={COLORS.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: COLORS.textMuted,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                NOW PLAYING
              </Text>
              <Text
                style={{
                  color: COLORS.text,
                  fontSize: 15,
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                {room.current_song}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: insets.bottom + 14,
          backgroundColor: COLORS.bg,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        }}
      >
        {!isParticipant ? (
          <TouchableOpacity
            onPress={() => joinMutation.mutate()}
            style={{
              backgroundColor: COLORS.brand,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              🎙 Join Room
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: COLORS.bgSecondary,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: COLORS.border,
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Hand size={18} color={COLORS.text} />
              <Text
                style={{ color: COLORS.text, fontSize: 14, fontWeight: "600" }}
              >
                Raise
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: COLORS.gold + "10",
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: COLORS.gold + "40",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Gift size={18} color={COLORS.gold} />
              <Text
                style={{ color: COLORS.gold, fontSize: 14, fontWeight: "600" }}
              >
                Gift
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => leaveMutation.mutate()}
              style={{
                flex: 1,
                backgroundColor: COLORS.error,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                Leave
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
