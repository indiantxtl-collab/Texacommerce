import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { useUpload } from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { Image as ExpoImage } from "expo-image";
import useUser from "@/utils/auth/useUser";
import { COLORS, SHADOW } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const [userId, setUserId] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { uploadFile } = useUpload();

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.user) {
            setUserId(d.user.id);
            setFullName(d.user.full_name || "");
            setUsername(d.user.username || "");
            setBio(d.user.bio || "");
            setPhone(d.user.phone || "");
            setProfilePicture(d.user.profile_picture);
          }
        });
    }
  }, [authUser]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setProfilePicture(result.assets[0].uri);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!fullName.trim()) throw new Error("Full name is required");
      setIsUploading(true);

      let profilePicUrl = profilePicture;
      if (profilePicture && profilePicture.startsWith("file://")) {
        profilePicUrl = await uploadFile(profilePicture);
      }

      setIsUploading(false);

      const res = await fetch(`/api/profile/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          full_name: fullName.trim(),
          username: username.trim(),
          bio: bio.trim() || null,
          phone: phone.trim() || null,
          profile_picture: profilePicUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      Alert.alert("Profile Updated!", "Your changes have been saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (e) => Alert.alert("Error", e.message),
  });

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <TxIcon name="back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.text }}>
            Edit Profile
          </Text>
          <TouchableOpacity
            onPress={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || isUploading}
          >
            <Text
              style={{ color: COLORS.brand, fontSize: 16, fontWeight: "700" }}
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          gap: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            onPress={pickImage}
            style={{ position: "relative" }}
          >
            <ExpoImage
              source={{
                uri: profilePicture || "https://via.placeholder.com/100",
              }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 3,
                borderColor: COLORS.brand,
              }}
              contentFit="cover"
            />
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: COLORS.brand,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: COLORS.bg,
              }}
            >
              <TxIcon name="camera" size={15} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              color: COLORS.brand,
              fontSize: 14,
              fontWeight: "600",
              marginTop: 10,
            }}
          >
            Change Photo
          </Text>
        </View>

        {/* Fields */}
        <View
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 16,
            padding: 16,
            ...SHADOW.sm,
            gap: 16,
          }}
        >
          {[
            {
              label: "Full Name *",
              value: fullName,
              setter: setFullName,
              placeholder: "Your full name",
            },
            {
              label: "Username",
              value: username,
              setter: setUsername,
              placeholder: "yourusername",
            },
            {
              label: "Bio",
              value: bio,
              setter: setBio,
              placeholder: "Tell us about yourself...",
              multiline: true,
            },
            {
              label: "Phone",
              value: phone,
              setter: setPhone,
              placeholder: "+1 234 567 8900",
              keyboard: "phone-pad",
            },
          ].map(
            ({ label, value, setter, placeholder, multiline, keyboard }) => (
              <View key={label}>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 13,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  {label}
                </Text>
                <TextInput
                  value={value}
                  onChangeText={setter}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  multiline={multiline}
                  keyboardType={keyboard}
                  style={{
                    backgroundColor: COLORS.bgSecondary,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    color: COLORS.text,
                    fontSize: 15,
                    minHeight: multiline ? 80 : undefined,
                    textAlignVertical: multiline ? "top" : undefined,
                  }}
                />
              </View>
            ),
          )}
        </View>

        <TouchableOpacity
          onPress={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || isUploading}
          style={{
            backgroundColor: COLORS.brand,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          {saveMutation.isPending || isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
