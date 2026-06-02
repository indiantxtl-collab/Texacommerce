import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { COLORS, SHADOW } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function VoiceScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: roomsData, refetch } = useQuery({
    queryKey: ["voice-rooms"],
    queryFn: async () => {
      const res = await fetch("/api/voice-rooms");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 8000,
  });

  const rooms = roomsData?.rooms || [];
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgSecondary }}>
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flex: 1,
            }}
          >
            <TxIcon name="micFill" size={22} color={COLORS.brand} />
            <Text
              style={{ fontSize: 22, fontWeight: "800", color: COLORS.text }}
            >
              Voice Rooms
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/create-room")}
            style={{
              backgroundColor: COLORS.brand,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TxIcon name="plus" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
              Create
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 12,
          paddingBottom: insets.bottom + 80,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.brand}
          />
        }
      >
        {rooms.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: COLORS.brand + "15",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <TxIcon name="mic" size={32} color={COLORS.brand} />
            </View>
            <Text
              style={{
                color: COLORS.text,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              No Active Rooms
            </Text>
            <Text
              style={{
                color: COLORS.textSecondary,
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Be the first to create a voice room!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/create-room")}
              style={{
                backgroundColor: COLORS.brand,
                borderRadius: 12,
                paddingHorizontal: 28,
                paddingVertical: 13,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                Create a Room
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          rooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              onPress={() => router.push(`/room/${room.id}`)}
              style={{
                backgroundColor: COLORS.bg,
                borderRadius: 16,
                overflow: "hidden",
                ...SHADOW.md,
              }}
            >
              {room.cover_image && (
                <ExpoImage
                  source={{ uri: room.cover_image }}
                  style={{ width: "100%", height: 110 }}
                  contentFit="cover"
                />
              )}
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {!room.cover_image && (
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: COLORS.brand + "15",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <TxIcon name="mic" size={22} color={COLORS.brand} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: COLORS.text,
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      {room.name}
                    </Text>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                      by @{room.host_username}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: COLORS.success + "15",
                      borderRadius: 20,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
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
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      LIVE
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <TxIcon name="users" size={15} color={COLORS.textMuted} />
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                      {room.participants_count || 0} in room
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push(`/room/${room.id}`)}
                    style={{
                      backgroundColor: COLORS.brand,
                      borderRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 7,
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}
                    >
                      Join
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
