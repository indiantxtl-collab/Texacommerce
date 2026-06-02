import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/auth/useUser";
import { COLORS, SHADOW } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function BattlesScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = React.useState(null);
  const [investAmounts, setInvestAmounts] = React.useState({});

  React.useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const { data: choicesData } = useQuery({
    queryKey: ["choices", currentUserId],
    queryFn: async () => {
      const res = await fetch(`/api/choices?userId=${currentUserId || ""}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ choiceId, selectedOption, coinsInvested }) => {
      const res = await fetch(`/api/choices/${choiceId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          selectedOption,
          coinsInvested: parseInt(coinsInvested) || 0,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["choices"]);
      setInvestAmounts({});
      Alert.alert("Vote Recorded!", "Good luck! Results when battle ends.");
    },
    onError: (e) => Alert.alert("Error", e.message),
  });

  const choices = choicesData?.choices || [];
  const userVotes = choicesData?.userVotes || [];

  const handleVote = (choiceId, option) => {
    const coinsToInvest = investAmounts[choiceId] || 0;
    voteMutation.mutate({
      choiceId,
      selectedOption: option,
      coinsInvested: coinsToInvest,
    });
  };

  const getTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  const getPercentage = (votesA, votesB) => {
    const total = (votesA || 0) + (votesB || 0);
    if (total === 0) return { a: 50, b: 50 };
    return {
      a: Math.round(((votesA || 0) / total) * 100),
      b: Math.round(((votesB || 0) / total) * 100),
    };
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <TxIcon name="back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TxIcon name="zapFill" size={20} color={COLORS.brand} />
              <Text
                style={{ fontSize: 22, fontWeight: "800", color: COLORS.text }}
              >
                Daily Battles
              </Text>
            </View>
            <Text
              style={{
                color: COLORS.textSecondary,
                fontSize: 13,
                marginTop: 2,
              }}
            >
              Vote and invest coins to win 2x rewards
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 12,
          gap: 12,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {choices.map((choice) => {
          const userVote = userVotes.find((v) => v.choice_id === choice.id);
          const percentages = getPercentage(choice.votes_a, choice.votes_b);

          return (
            <View
              key={choice.id}
              style={{
                backgroundColor: COLORS.bg,
                borderRadius: 20,
                padding: 20,
                ...SHADOW.md,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: COLORS.warning + "15",
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <TxIcon name="info" size={13} color={COLORS.warning} />
                  <Text
                    style={{
                      color: COLORS.warning,
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {getTimeLeft(choice.end_time)}
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <TxIcon name="coin" size={14} color={COLORS.gold} />
                  <Text
                    style={{
                      color: COLORS.gold,
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    {(choice.coins_a || 0) + (choice.coins_b || 0)} invested
                  </Text>
                </View>
              </View>

              {/* Option A */}
              <TouchableOpacity
                onPress={() =>
                  !userVote && handleVote(choice.id, choice.option_a)
                }
                disabled={!!userVote}
                style={{
                  backgroundColor:
                    userVote?.selected_option === choice.option_a
                      ? COLORS.brand
                      : COLORS.bgSecondary,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  opacity:
                    userVote && userVote.selected_option !== choice.option_a
                      ? 0.5
                      : 1,
                  borderWidth:
                    userVote?.selected_option === choice.option_a ? 0 : 1,
                  borderColor: COLORS.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color:
                        userVote?.selected_option === choice.option_a
                          ? "#fff"
                          : COLORS.text,
                      fontSize: 17,
                      fontWeight: "700",
                      flex: 1,
                    }}
                  >
                    {choice.option_a}
                  </Text>
                  <Text
                    style={{
                      color:
                        userVote?.selected_option === choice.option_a
                          ? "#fff"
                          : COLORS.brand,
                      fontSize: 16,
                      fontWeight: "800",
                    }}
                  >
                    {percentages.a}%
                  </Text>
                </View>
                {/* Progress bar */}
                <View
                  style={{
                    height: 4,
                    backgroundColor:
                      userVote?.selected_option === choice.option_a
                        ? "rgba(255,255,255,0.3)"
                        : COLORS.border,
                    borderRadius: 2,
                    marginTop: 8,
                  }}
                >
                  <View
                    style={{
                      height: 4,
                      width: `${percentages.a}%`,
                      backgroundColor:
                        userVote?.selected_option === choice.option_a
                          ? "#fff"
                          : COLORS.brand,
                      borderRadius: 2,
                    }}
                  />
                </View>
                <Text
                  style={{
                    color:
                      userVote?.selected_option === choice.option_a
                        ? "rgba(255,255,255,0.8)"
                        : COLORS.textMuted,
                    fontSize: 11,
                    marginTop: 6,
                  }}
                >
                  {choice.votes_a || 0} votes · {choice.coins_a || 0} coins
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  color: COLORS.textMuted,
                  textAlign: "center",
                  fontWeight: "800",
                  fontSize: 16,
                  marginBottom: 10,
                }}
              >
                VS
              </Text>

              {/* Option B */}
              <TouchableOpacity
                onPress={() =>
                  !userVote && handleVote(choice.id, choice.option_b)
                }
                disabled={!!userVote}
                style={{
                  backgroundColor:
                    userVote?.selected_option === choice.option_b
                      ? COLORS.brandSecondary
                      : COLORS.bgSecondary,
                  borderRadius: 14,
                  padding: 16,
                  opacity:
                    userVote && userVote.selected_option !== choice.option_b
                      ? 0.5
                      : 1,
                  borderWidth:
                    userVote?.selected_option === choice.option_b ? 0 : 1,
                  borderColor: COLORS.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color:
                        userVote?.selected_option === choice.option_b
                          ? "#fff"
                          : COLORS.text,
                      fontSize: 17,
                      fontWeight: "700",
                      flex: 1,
                    }}
                  >
                    {choice.option_b}
                  </Text>
                  <Text
                    style={{
                      color:
                        userVote?.selected_option === choice.option_b
                          ? "#fff"
                          : COLORS.brandSecondary,
                      fontSize: 16,
                      fontWeight: "800",
                    }}
                  >
                    {percentages.b}%
                  </Text>
                </View>
                <View
                  style={{
                    height: 4,
                    backgroundColor:
                      userVote?.selected_option === choice.option_b
                        ? "rgba(255,255,255,0.3)"
                        : COLORS.border,
                    borderRadius: 2,
                    marginTop: 8,
                  }}
                >
                  <View
                    style={{
                      height: 4,
                      width: `${percentages.b}%`,
                      backgroundColor:
                        userVote?.selected_option === choice.option_b
                          ? "#fff"
                          : COLORS.brandSecondary,
                      borderRadius: 2,
                    }}
                  />
                </View>
                <Text
                  style={{
                    color:
                      userVote?.selected_option === choice.option_b
                        ? "rgba(255,255,255,0.8)"
                        : COLORS.textMuted,
                    fontSize: 11,
                    marginTop: 6,
                  }}
                >
                  {choice.votes_b || 0} votes · {choice.coins_b || 0} coins
                </Text>
              </TouchableOpacity>

              {userVote ? (
                <View
                  style={{
                    marginTop: 14,
                    padding: 14,
                    backgroundColor: COLORS.gold + "10",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: COLORS.gold + "40",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <TxIcon name="coin" size={20} color={COLORS.gold} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: COLORS.gold,
                        fontSize: 14,
                        fontWeight: "700",
                      }}
                    >
                      Voted: {userVote.selected_option}
                    </Text>
                    <Text
                      style={{
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {userVote.coins_invested > 0
                        ? `${userVote.coins_invested} coins invested · Win double if correct!`
                        : "No coins invested"}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 14 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 8,
                    }}
                  >
                    <TxIcon
                      name="coin"
                      size={14}
                      color={COLORS.textSecondary}
                    />
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                      Invest coins (optional)
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TextInput
                      value={investAmounts[choice.id]?.toString() || ""}
                      onChangeText={(text) =>
                        setInvestAmounts({
                          ...investAmounts,
                          [choice.id]: text,
                        })
                      }
                      placeholder="Amount"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="number-pad"
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.bgSecondary,
                        borderRadius: 10,
                        padding: 12,
                        color: COLORS.text,
                        fontSize: 15,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                      }}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: COLORS.gold + "15",
                        borderRadius: 10,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: COLORS.gold + "40",
                      }}
                    >
                      <TxIcon name="coin" size={18} color={COLORS.gold} />
                      <Text
                        style={{
                          color: COLORS.gold,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        Coins
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {choices.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: COLORS.brand + "15",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <TxIcon name="zap" size={32} color={COLORS.brand} />
            </View>
            <Text
              style={{ color: COLORS.text, fontSize: 18, fontWeight: "700" }}
            >
              No Active Battles
            </Text>
            <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>
              Check back soon for new battles!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
