import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import useUser from "@/utils/auth/useUser";
import { COLORS, SHADOW } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";
import { TextInput } from "react-native";

const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", color: COLORS.error, pct: 0.2 };
  if (score <= 2) return { label: "Fair", color: COLORS.warning, pct: 0.5 };
  if (score <= 3) return { label: "Good", color: COLORS.info, pct: 0.75 };
  return { label: "Strong", color: COLORS.success, pct: 1 };
};

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const { data: authUser } = useUser();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authUser?.email) {
      fetch(`/api/profile/user-by-auth-id?email=${authUser.email}`)
        .then((r) => r.json())
        .then((d) => d.user && setCurrentUserId(d.user.id));
    }
  }, [authUser]);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert("Required", "Enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Too Short", "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      Alert.alert(
        "Same Password",
        "New password must be different from current.",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/custom/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.error || "Failed to change password.");
        return;
      }
      Alert.alert("Success", "Your password has been changed successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwStr = getStrength(newPassword);

  const Field = ({ label, value, onChange, secure, show, onToggle }) => (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: COLORS.textSecondary,
          fontSize: 12,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: COLORS.bgSecondary,
          borderRadius: 12,
          paddingHorizontal: 14,
          borderWidth: 1.5,
          borderColor: value ? COLORS.brand + "50" : COLORS.border,
        }}
      >
        <TxIcon
          name="lock"
          size={17}
          color={value ? COLORS.brand : COLORS.textMuted}
        />
        <TextInput
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            flex: 1,
            color: COLORS.text,
            fontSize: 15,
            paddingVertical: 13,
            marginLeft: 10,
          }}
        />
        <TouchableOpacity
          onPress={onToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <TxIcon
            name={show ? "eye" : "eyeOff"}
            size={17}
            color={COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <TxIcon name="back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.text }}>
            Change Password
          </Text>
        </View>
      </View>

      <View style={{ padding: 24 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            backgroundColor: COLORS.brand + "15",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 22,
            alignSelf: "center",
          }}
        >
          <TxIcon name="lock" size={28} color={COLORS.brand} />
        </View>

        <Field
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          secure
          show={showCurrent}
          onToggle={() => setShowCurrent((s) => !s)}
        />
        <Field
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          secure
          show={showNew}
          onToggle={() => setShowNew((s) => !s)}
        />

        {newPassword.length > 0 && (
          <View style={{ marginTop: -10, marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 3,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: COLORS.border,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${pwStr.pct * 100}%`,
                    height: "100%",
                    backgroundColor: pwStr.color,
                    borderRadius: 2,
                  }}
                />
              </View>
              <Text
                style={{ color: pwStr.color, fontSize: 11, fontWeight: "700" }}
              >
                {pwStr.label}
              </Text>
            </View>
          </View>
        )}

        <Field
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          secure
          show={showConfirm}
          onToggle={() => setShowConfirm((s) => !s)}
        />

        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
          <Text
            style={{
              color: COLORS.error,
              fontSize: 11,
              marginTop: -10,
              marginBottom: 16,
            }}
          >
            Passwords do not match
          </Text>
        )}

        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={
            loading || !currentPassword || !newPassword || !confirmPassword
          }
          style={{
            backgroundColor:
              currentPassword && newPassword && confirmPassword && !loading
                ? COLORS.brand
                : COLORS.textLight,
            borderRadius: 14,
            paddingVertical: 15.5,
            alignItems: "center",
            marginTop: 12,
            ...(currentPassword && newPassword && confirmPassword
              ? SHADOW.brand
              : {}),
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
              Change Password
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
