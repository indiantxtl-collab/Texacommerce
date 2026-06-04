/**
 * TEXA Onboarding — Custom Auth Flow
 *
 * Critical rules that MUST never be violated:
 * 1. `InputField` and `PrimaryButton` are defined OUTSIDE this component.
 *    Defining them inside causes React to unmount/remount TextInput on every
 *    keystroke, which dismisses the keyboard after each character.
 * 2. The `transition()` helper uses a loose `!= null` guard so that passing
 *    `undefined` as the first argument never calls `setMode(undefined)`.
 * 3. All onChange handlers are stable references (no inline arrow functions
 *    that recreate on every render touching TextInput directly).
 */

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import { useAuth } from "@/utils/auth/useAuth";
import { COLORS, LOGO_URL, APP_NAME, SHADOW } from "@/constants/theme";
import { TxIcon } from "@/components/SvgIcons";

const { height } = Dimensions.get("window");

// ─── UTILITIES ────────────────────────────────────────────────────────────────

const pwStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  if (s <= 1) return { label: "Weak", color: COLORS.error, pct: 0.2 };
  if (s <= 2) return { label: "Fair", color: COLORS.warning, pct: 0.5 };
  if (s <= 3) return { label: "Good", color: COLORS.info, pct: 0.75 };
  return { label: "Strong", color: COLORS.success, pct: 1 };
};

// ─── SHARED COMPONENTS (defined OUTSIDE — never recreated on re-render) ───────

/**
 * InputField — must live outside OnboardingScreen.
 * If defined inside, every setState in the parent creates a new component
 * type, React unmounts → remounts TextInput → keyboard closes each keystroke.
 */
const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  showSecret,
  onToggleSecret,
  keyboardType,
  autoCapitalize,
  returnKeyType,
  onSubmitEditing,
  inputRef,
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.bgSecondary,
      borderRadius: 14,
      paddingHorizontal: 14,
      marginBottom: 13,
      borderWidth: 1.5,
      borderColor: value ? COLORS.brand + "55" : COLORS.border,
    }}
  >
    <TxIcon
      name={icon}
      size={17}
      color={value ? COLORS.brand : COLORS.textMuted}
    />
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textMuted}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType || "default"}
      autoCapitalize={autoCapitalize || "none"}
      autoCorrect={false}
      autoComplete="off"
      returnKeyType={returnKeyType || "next"}
      onSubmitEditing={onSubmitEditing}
      style={{
        flex: 1,
        color: COLORS.text,
        fontSize: 15,
        paddingVertical: 14,
        marginLeft: 11,
      }}
    />
    {onToggleSecret && (
      <TouchableOpacity
        onPress={onToggleSecret}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <TxIcon
          name={showSecret ? "eye" : "eyeOff"}
          size={17}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>
    )}
  </View>
);

const PrimaryButton = ({ label, onPress, secondary, disabled, loading }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.75}
    style={{
      backgroundColor: secondary
        ? COLORS.bg
        : disabled || loading
          ? COLORS.textLight
          : COLORS.brand,
      borderRadius: 15,
      paddingVertical: 15.5,
      alignItems: "center",
      borderWidth: secondary ? 1.5 : 0,
      borderColor: COLORS.border,
      ...(!secondary && !disabled && !loading ? SHADOW.brand : {}),
    }}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text
        style={{
          color: secondary ? COLORS.text : "#fff",
          fontSize: 16,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    )}
  </TouchableOpacity>
);

const StrengthBar = ({ password }) => {
  if (!password) return null;
  const str = pwStrength(password);
  return (
    <View style={{ marginTop: -6, marginBottom: 12 }}>
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
              width: `${str.pct * 100}%`,
              height: "100%",
              backgroundColor: str.color,
              borderRadius: 2,
            }}
          />
        </View>
        <Text
          style={{
            color: str.color,
            fontSize: 11,
            fontWeight: "700",
            width: 44,
          }}
        >
          {str.label}
        </Text>
      </View>
    </View>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  // We use setAuth directly — our custom login API already verified
  // credentials, so we set auth state from the API response. Calling signIn()
  // would open a WebView for the platform's separate auth flow, which is wrong.
  const { setAuth } = useAuth();

  // Navigation state
  const [mode, setMode] = useState("welcome"); // welcome | login | signup | forgotPw
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Signup fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Forgot password
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Stable handler refs to avoid re-render churn
  const setUsernameClean = useCallback(
    (t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, "")),
    [],
  );
  const toggleLoginPw = useCallback(() => setShowLoginPw((s) => !s), []);
  const togglePw = useCallback(() => setShowPw((s) => !s), []);
  const toggleConfirmPw = useCallback(() => setShowConfirmPw((s) => !s), []);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Input refs for focus management
  const loginPwRef = useRef(null);
  const usernamRef = useRef(null);
  const emailRef = useRef(null);
  const dobRef = useRef(null);
  const pwRef = useRef(null);
  const confirmPwRef = useRef(null);
  const resetEmailRef = useRef(null);

  /**
   * transition — animates between screens.
   *
   * IMPORTANT: use `undefined` (not `null`) for the arg you don't want to
   * change.  `null != null` is false; `undefined != null` is also false — so
   * both are safe guards.  But passing `null` as nextMode used to call
   * setMode(null) because `null !== undefined` is true, which broke rendering.
   */
  const transition = useCallback(
    (nextMode, nextStep) => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Only update state for non-null/undefined values
        if (nextMode != null) setMode(nextMode);
        if (nextStep != null) setStep(nextStep);

        slideAnim.setValue(20);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [fadeAnim, slideAnim],
  );

  const animated = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  // ── AUTH HANDLERS ──────────────────────────────────────────────────────────

  const handleLogin = useCallback(async () => {
    if (!loginEmail.trim() || !loginPassword) {
      Alert.alert("Required", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/custom/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Sign In Failed", data.error || "Invalid credentials.");
        return;
      }
      // ✅ Directly write user session into SecureStore via setAuth.
      // This sets isAuthenticated → true, and index.jsx redirects to /(tabs)/home.
      setAuth({ user: data.user });
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loginEmail, loginPassword, setAuth]);

  const handleStep1 = useCallback(() => {
    const name = fullName.trim();
    const uname = username.trim();
    if (!name || name.length < 2) {
      Alert.alert("Required", "Enter your full name (2+ characters).");
      return;
    }
    if (!uname || uname.length < 3) {
      Alert.alert("Required", "Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(uname)) {
      Alert.alert(
        "Invalid",
        "Username: lowercase letters, numbers, underscores only.",
      );
      return;
    }
    // Use undefined so mode stays as "signup"
    transition(undefined, 2);
  }, [fullName, username, transition]);

  const handleStep2 = useCallback(() => {
    const em = email.trim();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      Alert.alert("Invalid", "Enter a valid email address.");
      return;
    }
    if (!dob.trim()) {
      Alert.alert("Required", "Please enter your date of birth.");
      return;
    }
    const age = (Date.now() - new Date(dob).getTime()) / 31557600000;
    if (isNaN(age) || age < 13) {
      Alert.alert("Age Restriction", "You must be at least 13 years old.");
      return;
    }
    transition(undefined, 3);
  }, [email, dob, transition]);

  const handleStep3 = useCallback(async () => {
    if (password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPw) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/custom/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          dateOfBirth: dob.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Signup Failed", data.error || "Failed to create account.");
        return;
      }
      Alert.alert(
        "Account Created!",
        `Welcome to ${APP_NAME}, ${fullName.trim().split(" ")[0]}! Please sign in.`,
        [
          {
            text: "Sign In",
            onPress: () => {
              setLoginEmail(email.trim().toLowerCase());
              transition("login", undefined);
            },
          },
        ],
      );
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fullName, username, email, dob, password, confirmPw, transition]);

  const handleForgotPw = useCallback(async () => {
    const em = resetEmail.trim();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      Alert.alert("Invalid", "Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/custom/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em.toLowerCase() }),
      });
      if (res.ok) setResetSent(true);
      else {
        const d = await res.json();
        Alert.alert("Error", d.error || "Failed to send reset link.");
      }
    } catch {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [resetEmail]);

  // Navigation helpers — stable callbacks
  const goWelcome = useCallback(
    () => transition("welcome", undefined),
    [transition],
  );
  const goLogin = useCallback(
    () => transition("login", undefined),
    [transition],
  );
  const goSignup = useCallback(() => transition("signup", 1), [transition]);
  const goForgotPw = useCallback(
    () => transition("forgotPw", undefined),
    [transition],
  );
  const goBack = useCallback(() => {
    if (mode === "signup" && step > 1) transition(undefined, step - 1);
    else transition("welcome", undefined);
  }, [mode, step, transition]);

  // ── RENDER ─────────────────────────────────────────────────────────────────

  if (mode === "welcome") {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StatusBar style="dark" />
        {/* Background blobs */}
        <View
          style={{
            position: "absolute",
            top: -height * 0.12,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: 140,
            backgroundColor: COLORS.brand + "07",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -80,
            left: -40,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: COLORS.brandSecondary + "07",
          }}
        />
        <Animated.View style={{ flex: 1, paddingTop: insets.top, ...animated }}>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
            }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 22,
                backgroundColor: COLORS.bg,
                alignItems: "center",
                justifyContent: "center",
                ...SHADOW.lg,
                borderWidth: 1,
                borderColor: COLORS.border,
                marginBottom: 22,
              }}
            >
              <ExpoImage
                source={{ uri: LOGO_URL }}
                style={{ width: 74, height: 74, borderRadius: 16 }}
                contentFit="contain"
              />
            </View>
            <Text
              style={{
                fontSize: 44,
                fontWeight: "900",
                color: COLORS.brand,
                letterSpacing: -1,
                marginBottom: 10,
              }}
            >
              {APP_NAME}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: COLORS.textSecondary,
                textAlign: "center",
                lineHeight: 25,
                maxWidth: 260,
                marginBottom: 44,
              }}
            >
              Social. Commerce. Voice. Reels.{"\n"}All in one place.
            </Text>
            {[
              { icon: "play", label: "Create & watch short reels" },
              { icon: "store", label: "Shop and sell anything" },
              { icon: "mic", label: "Join live voice rooms" },
            ].map(({ icon, label }) => (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  marginBottom: 14,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    backgroundColor: COLORS.brand + "12",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <TxIcon name={icon} size={17} color={COLORS.brand} />
                </View>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
          <View
            style={{
              paddingHorizontal: 22,
              paddingBottom: insets.bottom + 28,
              gap: 11,
            }}
          >
            <PrimaryButton label="Create Account" onPress={goSignup} />
            <PrimaryButton label="Sign In" onPress={goLogin} secondary />
          </View>
        </Animated.View>
      </View>
    );
  }

  if (mode === "login") {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: COLORS.bg }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              paddingTop: insets.top + 20,
              paddingHorizontal: 24,
              paddingBottom: insets.bottom + 24,
              ...animated,
            }}
          >
            <TouchableOpacity onPress={goWelcome} style={{ marginBottom: 28 }}>
              <TxIcon name="back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={{ alignItems: "center", marginBottom: 36 }}>
              <ExpoImage
                source={{ uri: LOGO_URL }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 13,
                  marginBottom: 14,
                }}
                contentFit="contain"
              />
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "800",
                  color: COLORS.text,
                  marginBottom: 5,
                }}
              >
                Welcome back
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                Sign in to your {APP_NAME} account
              </Text>
            </View>

            <InputField
              icon="user"
              placeholder="Email address"
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => loginPwRef.current?.focus()}
            />
            <InputField
              inputRef={loginPwRef}
              icon="lock"
              placeholder="Password"
              value={loginPassword}
              onChangeText={setLoginPassword}
              secureTextEntry={!showLoginPw}
              showSecret={showLoginPw}
              onToggleSecret={toggleLoginPw}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              onPress={goForgotPw}
              style={{ alignSelf: "flex-end", marginBottom: 24, marginTop: -4 }}
            >
              <Text
                style={{ color: COLORS.brand, fontSize: 13, fontWeight: "700" }}
              >
                Forgot password?
              </Text>
            </TouchableOpacity>

            <View style={{ gap: 11 }}>
              <PrimaryButton
                label="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={!loginEmail.trim() || !loginPassword}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 5,
                  paddingTop: 6,
                }}
              >
                <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                  No account?
                </Text>
                <TouchableOpacity onPress={goSignup}>
                  <Text
                    style={{
                      color: COLORS.brand,
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (mode === "signup") {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: COLORS.bg }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              paddingTop: insets.top + 20,
              paddingHorizontal: 24,
              paddingBottom: insets.bottom + 24,
              ...animated,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 26,
              }}
            >
              <TouchableOpacity onPress={goBack} style={{ marginRight: 14 }}>
                <TxIcon name="back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 18,
                    fontWeight: "800",
                  }}
                >
                  Create Account
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                  Step {step} of 3
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 5 }}>
                {[1, 2, 3].map((s) => (
                  <View
                    key={s}
                    style={{
                      width: s === step ? 18 : 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: s <= step ? COLORS.brand : COLORS.border,
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Step 1 */}
            {step === 1 && (
              <>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 22,
                    fontWeight: "800",
                    marginBottom: 5,
                  }}
                >
                  Who are you?
                </Text>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 14,
                    marginBottom: 26,
                    lineHeight: 21,
                  }}
                >
                  Your name and username help people find and recognise you
                </Text>
                <InputField
                  icon="user"
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => usernamRef.current?.focus()}
                />
                <InputField
                  inputRef={usernamRef}
                  icon="search"
                  placeholder="Username (e.g. john_doe)"
                  value={username}
                  onChangeText={setUsernameClean}
                  returnKeyType="done"
                  onSubmitEditing={handleStep1}
                />
                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 11,
                    marginBottom: 26,
                    lineHeight: 17,
                  }}
                >
                  Lowercase letters, numbers and underscores only. Min 3 chars.
                </Text>
                <PrimaryButton
                  label="Continue"
                  onPress={handleStep1}
                  disabled={
                    fullName.trim().length < 2 || username.trim().length < 3
                  }
                />
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 22,
                    fontWeight: "800",
                    marginBottom: 5,
                  }}
                >
                  Contact Info
                </Text>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 14,
                    marginBottom: 26,
                    lineHeight: 21,
                  }}
                >
                  Your email keeps your account secure and recoverable
                </Text>
                <InputField
                  icon="user"
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => dobRef.current?.focus()}
                />
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 12,
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Date of Birth
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: COLORS.bgSecondary,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    marginBottom: 13,
                    borderWidth: 1.5,
                    borderColor: dob ? COLORS.brand + "55" : COLORS.border,
                  }}
                >
                  <TxIcon
                    name="info"
                    size={17}
                    color={dob ? COLORS.brand : COLORS.textMuted}
                  />
                  <TextInput
                    ref={dobRef}
                    value={dob}
                    onChangeText={setDob}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numbers-and-punctuation"
                    returnKeyType="done"
                    onSubmitEditing={handleStep2}
                    style={{
                      flex: 1,
                      color: COLORS.text,
                      fontSize: 15,
                      paddingVertical: 14,
                      marginLeft: 11,
                    }}
                  />
                </View>
                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 11,
                    marginBottom: 26,
                    lineHeight: 17,
                  }}
                >
                  You must be 13+ to join {APP_NAME}. Format: YYYY-MM-DD (e.g.
                  2000-01-25)
                </Text>
                <PrimaryButton
                  label="Continue"
                  onPress={handleStep2}
                  disabled={!email.trim() || !dob.trim()}
                />
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 22,
                    fontWeight: "800",
                    marginBottom: 5,
                  }}
                >
                  Secure Your Account
                </Text>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 14,
                    marginBottom: 26,
                    lineHeight: 21,
                  }}
                >
                  Choose a strong password to protect your {APP_NAME} account
                </Text>
                <InputField
                  inputRef={pwRef}
                  icon="lock"
                  placeholder="Create password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                  showSecret={showPw}
                  onToggleSecret={togglePw}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPwRef.current?.focus()}
                />
                <StrengthBar password={password} />
                <InputField
                  inputRef={confirmPwRef}
                  icon="lock"
                  placeholder="Confirm password"
                  value={confirmPw}
                  onChangeText={setConfirmPw}
                  secureTextEntry={!showConfirmPw}
                  showSecret={showConfirmPw}
                  onToggleSecret={toggleConfirmPw}
                  returnKeyType="done"
                  onSubmitEditing={handleStep3}
                />
                {confirmPw.length > 0 && password !== confirmPw && (
                  <Text
                    style={{
                      color: COLORS.error,
                      fontSize: 11,
                      marginTop: -7,
                      marginBottom: 12,
                    }}
                  >
                    Passwords do not match
                  </Text>
                )}
                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 11,
                    lineHeight: 17,
                    marginBottom: 24,
                  }}
                >
                  By creating an account you agree to our Terms of Service and
                  Privacy Policy.
                </Text>
                <PrimaryButton
                  label="Create Account"
                  onPress={handleStep3}
                  loading={loading}
                  disabled={password.length < 8 || password !== confirmPw}
                />
              </>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 5,
                marginTop: 22,
              }}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={goLogin}>
                <Text
                  style={{
                    color: COLORS.brand,
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (mode === "forgotPw") {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: COLORS.bg }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              flex: 1,
              paddingTop: insets.top + 20,
              paddingHorizontal: 24,
              paddingBottom: insets.bottom + 24,
              ...animated,
            }}
          >
            <TouchableOpacity onPress={goLogin} style={{ marginBottom: 28 }}>
              <TxIcon name="back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            {!resetSent ? (
              <>
                <View style={{ alignItems: "center", marginBottom: 36 }}>
                  <View
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 18,
                      backgroundColor: COLORS.brand + "15",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    <TxIcon name="lock" size={30} color={COLORS.brand} />
                  </View>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "800",
                      color: COLORS.text,
                      marginBottom: 7,
                    }}
                  >
                    Forgot Password?
                  </Text>
                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 14,
                      textAlign: "center",
                      lineHeight: 21,
                    }}
                  >
                    Enter your email and we'll send you a link to reset your
                    password
                  </Text>
                </View>
                <InputField
                  inputRef={resetEmailRef}
                  icon="user"
                  placeholder="Email address"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  keyboardType="email-address"
                  returnKeyType="done"
                  onSubmitEditing={handleForgotPw}
                />
                <View style={{ marginTop: 10 }}>
                  <PrimaryButton
                    label="Send Reset Link"
                    onPress={handleForgotPw}
                    loading={loading}
                    disabled={!resetEmail.trim()}
                  />
                </View>
              </>
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: 39,
                    backgroundColor: COLORS.successLight,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <TxIcon name="checkCircle" size={38} color={COLORS.success} />
                </View>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: COLORS.text,
                    marginBottom: 10,
                  }}
                >
                  Email Sent!
                </Text>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 14,
                    textAlign: "center",
                    lineHeight: 21,
                    marginBottom: 36,
                  }}
                >
                  Check {resetEmail} for a password reset link. It expires in 1
                  hour.
                </Text>
                <PrimaryButton label="Back to Sign In" onPress={goLogin} />
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Fallback — should never reach here
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
      <ActivityIndicator color={COLORS.brand} size="large" />
    </View>
  );
}
