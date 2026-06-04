import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions, Easing } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Image as ExpoImage } from "expo-image";
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
  Ellipse,
} from "react-native-svg";
import { LOGO_URL, COLORS, APP_NAME } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

// Animated SVG ring component
const AnimatedRing = ({ size, color, delay, opacity = 0.15 }) => {
  const scale = useRef(new Animated.Value(0.4)).current;
  const alpha = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.4,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(alpha, {
              toValue: opacity,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(alpha, {
              toValue: 0,
              duration: 1800,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: color,
        opacity: alpha,
        transform: [{ scale }],
      }}
    />
  );
};

export default function SplashScreen({ onComplete }) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // Stagger dots animation
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main entrance sequence
    Animated.sequence([
      // Logo appears with spring
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      // App name slides up
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),

      // Tagline fades in
      Animated.delay(80),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 340,
        useNativeDriver: true,
      }),

      // Loading dots appear
      Animated.delay(300),
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animate dots
      const dotLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.delay(160),
          Animated.parallel([
            Animated.timing(dot1, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(dot2, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(dot3, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(100),
        ]),
      );
      dotLoop.start();

      // Complete and fade out after 2.2s
      setTimeout(() => {
        dotLoop.stop();
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 380,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          if (onComplete) onComplete();
        });
      }, 2200);
    });
  }, []);

  const dotScale = (anim) => ({
    transform: [
      {
        scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
      },
    ],
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: COLORS.bg,
        alignItems: "center",
        justifyContent: "center",
        opacity: containerOpacity,
        zIndex: 9999,
      }}
    >
      <StatusBar style="dark" />

      {/* Background gradient decoration */}
      <View style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <View
          style={{
            position: "absolute",
            top: -height * 0.18,
            right: -width * 0.2,
            width: width * 0.7,
            height: width * 0.7,
            borderRadius: width * 0.35,
            backgroundColor: COLORS.brand + "08",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -height * 0.12,
            left: -width * 0.15,
            width: width * 0.55,
            height: width * 0.55,
            borderRadius: width * 0.275,
            backgroundColor: COLORS.brandSecondary + "08",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: "35%",
            left: -width * 0.1,
            width: width * 0.35,
            height: width * 0.35,
            borderRadius: width * 0.175,
            backgroundColor: COLORS.brandPink + "06",
          }}
        />
      </View>

      {/* Pulsing rings */}
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <AnimatedRing
          size={200}
          color={COLORS.brand}
          delay={0}
          opacity={0.12}
        />
        <AnimatedRing
          size={280}
          color={COLORS.brandSecondary}
          delay={400}
          opacity={0.08}
        />
        <AnimatedRing
          size={360}
          color={COLORS.brandPink}
          delay={800}
          opacity={0.05}
        />

        {/* Logo container */}
        <Animated.View
          style={{
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          }}
        >
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 26,
              backgroundColor: COLORS.bg,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: COLORS.brand,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 24,
              elevation: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <ExpoImage
              source={{ uri: LOGO_URL }}
              style={{ width: 84, height: 84, borderRadius: 18 }}
              contentFit="contain"
            />
          </View>
        </Animated.View>
      </View>

      {/* App Name */}
      <Animated.Text
        style={{
          fontSize: 46,
          fontWeight: "900",
          color: COLORS.brand,
          letterSpacing: -1,
          marginTop: 28,
          opacity: textOpacity,
          transform: [{ translateY: textSlide }],
        }}
      >
        {APP_NAME}
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={{
          fontSize: 14,
          color: COLORS.textSecondary,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginTop: 6,
          opacity: taglineOpacity,
          fontWeight: "600",
        }}
      >
        Social · Commerce · Voice
      </Animated.Text>

      {/* Loading dots */}
      <Animated.View
        style={{
          flexDirection: "row",
          gap: 7,
          marginTop: 56,
          opacity: dotsOpacity,
        }}
      >
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: COLORS.brand,
              ...dotScale(dot),
            }}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
}
