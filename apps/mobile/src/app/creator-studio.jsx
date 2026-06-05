import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Sparkles,
  Hash,
  BarChart3,
  Image as ImageIcon,
  Scissors,
  Music,
  Clock,
  Save,
} from "lucide-react-native";
import { useRouter } from "expo-router";

export default function CreatorStudio() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [videoDescription, setVideoDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [tone, setTone] = useState("casual");
  const [analytics, setAnalytics] = useState(null);

  const generateCaption = async () => {
    if (!videoDescription.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/creator-studio/ai-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoDescription, tone }),
      });
      const data = await response.json();
      if (data.caption) setCaption(data.caption);
    } catch (error) {
      console.error("Caption generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateHashtags = async () => {
    if (!videoDescription.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/creator-studio/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: videoDescription, count: 8 }),
      });
      const data = await response.json();
      if (data.hashtags) setHashtags(data.hashtags);
    } catch (error) {
      console.error("Hashtag generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/creator-studio/analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  const tones = ["casual", "professional", "funny", "motivational"];

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "#222" }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
          Creator Studio
        </Text>
        <Text style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
          AI-powered tools for creators
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Video Description Input */}
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#fff",
              marginBottom: 8,
            }}
          >
            Video Description
          </Text>
          <TextInput
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 12,
              padding: 16,
              color: "#fff",
              fontSize: 15,
              minHeight: 100,
              textAlignVertical: "top",
            }}
            placeholder="Describe your video content..."
            placeholderTextColor="#666"
            multiline
            value={videoDescription}
            onChangeText={setVideoDescription}
          />
        </View>

        {/* Tone Selector */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Tone
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {tones.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTone(t)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: tone === t ? "#8B5CF6" : "#1a1a1a",
                  borderWidth: 1,
                  borderColor: tone === t ? "#8B5CF6" : "#333",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Tools */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {/* Generate Caption */}
          <TouchableOpacity
            onPress={generateCaption}
            disabled={loading || !videoDescription.trim()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#8B5CF6",
              padding: 16,
              borderRadius: 12,
              opacity: !videoDescription.trim() ? 0.5 : 1,
            }}
          >
            <Sparkles size={20} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "600",
                marginLeft: 12,
                flex: 1,
              }}
            >
              Generate AI Caption
            </Text>
            {loading && <ActivityIndicator color="#fff" />}
          </TouchableOpacity>

          {/* Generate Hashtags */}
          <TouchableOpacity
            onPress={generateHashtags}
            disabled={loading || !videoDescription.trim()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#10B981",
              padding: 16,
              borderRadius: 12,
              opacity: !videoDescription.trim() ? 0.5 : 1,
            }}
          >
            <Hash size={20} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "600",
                marginLeft: 12,
                flex: 1,
              }}
            >
              Generate Hashtags
            </Text>
            {loading && <ActivityIndicator color="#fff" />}
          </TouchableOpacity>

          {/* View Analytics */}
          <TouchableOpacity
            onPress={loadAnalytics}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F59E0B",
              padding: 16,
              borderRadius: 12,
            }}
          >
            <BarChart3 size={20} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "600",
                marginLeft: 12,
                flex: 1,
              }}
            >
              View Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Generated Caption */}
        {caption ? (
          <View style={{ padding: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Sparkles size={18} color="#8B5CF6" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#fff",
                  marginLeft: 8,
                }}
              >
                Generated Caption
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15, lineHeight: 22 }}>
                {caption}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Generated Hashtags */}
        {hashtags.length > 0 ? (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Hash size={18} color="#10B981" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#fff",
                  marginLeft: 8,
                }}
              >
                Generated Hashtags
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {hashtags.map((tag, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: "#1a1a1a",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#10B981",
                  }}
                >
                  <Text
                    style={{
                      color: "#10B981",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Analytics */}
        {analytics ? (
          <View style={{ padding: 20 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#fff",
                marginBottom: 16,
              }}
            >
              Analytics
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: "#1a1a1a",
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>
                  Total Views
                </Text>
                <Text
                  style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}
                >
                  {analytics.totals.views.toLocaleString()}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: "#1a1a1a",
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>
                  Total Likes
                </Text>
                <Text
                  style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}
                >
                  {analytics.totals.likes.toLocaleString()}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: "#1a1a1a",
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>
                  Engagement Rate
                </Text>
                <Text
                  style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}
                >
                  {analytics.engagementRate}%
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: "#1a1a1a",
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>
                  Followers
                </Text>
                <Text
                  style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}
                >
                  {analytics.followerCount.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Recent Reels */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              Recent Reels
            </Text>
            {analytics.reels.slice(0, 5).map((reel) => (
              <View
                key={reel.id}
                style={{
                  backgroundColor: "#1a1a1a",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                  numberOfLines={2}
                >
                  {reel.caption || "Untitled"}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#888", fontSize: 13 }}>
                    👁 {reel.views}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 13 }}>
                    ❤️ {reel.likes}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 13 }}>
                    💬 {reel.comments}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 13 }}>
                    🔖 {reel.saves}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
