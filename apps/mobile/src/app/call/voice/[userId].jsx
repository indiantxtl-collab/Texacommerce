import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Phone, MicOff, Mic, Speaker, PhoneOff } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { COLORS } from "@/constants/theme";
import useUser from "@/utils/auth/useUser";

export default function VoiceCallScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams();
  const { data: authUser } = useUser();
  const [callState, setCallState] = useState("calling"); // calling | connected | ended
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [otherUser, setOtherUser] = useState(null);
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fetch other user info
    fetch(`/api/profile/${userId}`)
      .then((r) => r.json())
      .then((d) => d.user && setOtherUser(d.user))
      .catch(() => {});

    // Simulate call connecting after 3s
    const connectTimer = setTimeout(() => {
      setCallState("connected");
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    }, 3000);

    return () => {
      clearTimeout(connectTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [userId]);

  useEffect(() => {
    if (callState === "calling") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [callState]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState("ended");
    setTimeout(() => router.back(), 1200);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: callState === "connected" ? "#1a1a2e" : "#0f3460",
      }}
    >
      <StatusBar style="light" />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: insets.top,
        }}
      >
        {/* Avatar */}
        <Animated.View
          style={{
            transform: [{ scale: callState === "calling" ? pulseAnim : 1 }],
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 130,
              height: 130,
              borderRadius: 65,
              borderWidth: 4,
              borderColor: callState === "connected" ? COLORS.success : "#fff",
              overflow: "hidden",
            }}
          >
            <ExpoImage
              source={{
                uri:
                  otherUser?.profile_picture ||
                  "https://via.placeholder.com/130",
              }}
              style={{ width: 130, height: 130 }}
              contentFit="cover"
            />
          </View>
        </Animated.View>

        <Text
          style={{
            color: "#fff",
            fontSize: 26,
            fontWeight: "800",
            marginBottom: 8,
          }}
        >
          {otherUser?.full_name || "Unknown"}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>
          {callState === "calling"
            ? "Calling..."
            : callState === "connected"
              ? formatDuration(callDuration)
              : "Call Ended"}
        </Text>

        {callState === "connected" && (
          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
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
              style={{ color: COLORS.success, fontSize: 13, fontWeight: "600" }}
            >
              Voice Connected
            </Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View
        style={{ paddingBottom: insets.bottom + 40, paddingHorizontal: 40 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <TouchableOpacity
            onPress={() => setIsMuted((m) => !m)}
            style={{ alignItems: "center", gap: 8 }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: isMuted
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isMuted ? (
                <MicOff size={28} color="#fff" />
              ) : (
                <Mic size={28} color="#fff" />
              )}
            </View>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
              {isMuted ? "Unmute" : "Mute"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleEndCall}
            style={{ alignItems: "center", gap: 8 }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: COLORS.error,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PhoneOff size={32} color="#fff" />
            </View>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
              End Call
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSpeaker((s) => !s)}
            style={{ alignItems: "center", gap: 8 }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: isSpeaker
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Speaker size={28} color="#fff" />
            </View>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
              Speaker
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
