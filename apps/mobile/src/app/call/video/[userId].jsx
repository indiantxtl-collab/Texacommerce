import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MicOff,
  Mic,
  VideoOff,
  Video,
  PhoneOff,
  CameraIcon,
  RotateCcw,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { COLORS } from "@/constants/theme";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function VideoCallScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams();
  const [callState, setCallState] = useState("calling");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [otherUser, setOtherUser] = useState(null);
  const [facing, setFacing] = useState("front");
  const [permission, requestPermission] = useCameraPermissions();
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    requestPermission();
    fetch(`/api/profile/${userId}`)
      .then((r) => r.json())
      .then((d) => d.user && setOtherUser(d.user))
      .catch(() => {});

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
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
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
    setTimeout(() => router.back(), 1000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      {/* Remote video (full screen) - placeholder with avatar */}
      <View
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#1a1a2e",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {callState === "calling" ? (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <ExpoImage
              source={{
                uri:
                  otherUser?.profile_picture ||
                  "https://via.placeholder.com/200",
              }}
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                borderWidth: 4,
                borderColor: "#fff",
              }}
              contentFit="cover"
            />
          </Animated.View>
        ) : (
          <View
            style={{
              flex: 1,
              width: "100%",
              backgroundColor: "#2a2a3e",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ExpoImage
              source={{
                uri:
                  otherUser?.profile_picture ||
                  "https://via.placeholder.com/200",
              }}
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                opacity: 0.8,
              }}
              contentFit="cover"
            />
            <Text
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                marginTop: 16,
              }}
            >
              Video connecting...
            </Text>
          </View>
        )}
      </View>

      {/* Local camera - top right PiP */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 16,
          right: 16,
          width: 100,
          height: 140,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: "#fff",
        }}
      >
        {!isCameraOff && permission?.granted ? (
          <CameraView facing={facing} style={{ flex: 1 }} />
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: "#333",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <VideoOff size={28} color="#666" />
          </View>
        )}
      </View>

      {/* Call info overlay */}
      <View style={{ position: "absolute", top: insets.top + 16, left: 16 }}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
          {otherUser?.full_name || "Unknown"}
        </Text>
        <Text
          style={{
            color:
              callState === "connected"
                ? COLORS.success
                : "rgba(255,255,255,0.7)",
            fontSize: 14,
          }}
        >
          {callState === "calling"
            ? "Calling..."
            : callState === "connected"
              ? formatDuration(callDuration)
              : "Ended"}
        </Text>
      </View>

      {/* Controls Bottom */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + 30,
          paddingHorizontal: 40,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => setIsMuted((m) => !m)}
            style={{ alignItems: "center", gap: 8 }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: isMuted
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isMuted ? (
                <MicOff size={26} color="#fff" />
              ) : (
                <Mic size={26} color="#fff" />
              )}
            </View>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
              {isMuted ? "Unmute" : "Mute"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleEndCall}
            style={{ alignItems: "center", gap: 8 }}
          >
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                backgroundColor: COLORS.error,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PhoneOff size={30} color="#fff" />
            </View>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
              End
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsCameraOff((c) => !c)}
            style={{ alignItems: "center", gap: 8 }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: isCameraOff
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isCameraOff ? (
                <VideoOff size={26} color="#fff" />
              ) : (
                <Video size={26} color="#fff" />
              )}
            </View>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
              Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFacing((f) => (f === "front" ? "back" : "front"))}
            style={{ alignItems: "center", gap: 8 }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RotateCcw size={26} color="#fff" />
            </View>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
              Flip
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
