// Texa App Theme - White/Light Theme
export const COLORS = {
  // Backgrounds
  bg: "#FFFFFF",
  bgSecondary: "#F5F5F7",
  bgCard: "#FFFFFF",
  bgInput: "#F5F5F7",

  // Borders
  border: "#E5E5EA",
  borderLight: "#F0F0F5",

  // Text
  text: "#111111",
  textSecondary: "#555555",
  textMuted: "#999999",
  textLight: "#BBBBBB",

  // Brand - Gradient Colors
  brand: "#FF6B35", // Orange (from logo)
  brandSecondary: "#9B2FAD", // Purple (from logo)
  brandPink: "#FF1493", // Pink (from logo)
  brandYellow: "#F5C518", // Yellow (from logo)

  // Accent
  accent: "#FF6B35",
  accentLight: "#FFF0EB",

  // Status
  success: "#34C759",
  successLight: "#E8F8EE",
  error: "#FF3B30",
  errorLight: "#FEE8E7",
  warning: "#FF9500",
  warningLight: "#FFF4E5",
  info: "#007AFF",
  infoLight: "#E5F0FF",

  // Special
  gold: "#F5A623",
  goldLight: "#FDF5E4",
  white: "#FFFFFF",
  black: "#000000",

  // Overlay
  overlay: "rgba(0,0,0,0.5)",
  overlayLight: "rgba(0,0,0,0.1)",
};

export const LOGO_URL =
  "https://dtvoeevhaseb5.cloudfront.net/user-uploads/6fef1cbd-d9cc-457b-893f-f9c654b307ad.png";
export const APP_NAME = "Texa";

export const GRADIENT_BRAND = ["#F5C518", "#FF6B35", "#FF1493", "#9B2FAD"];
export const GRADIENT_BRAND_SIMPLE = ["#FF6B35", "#9B2FAD"];

export const FONTS = {
  regular: { fontWeight: "400" },
  medium: { fontWeight: "500" },
  semibold: { fontWeight: "600" },
  bold: { fontWeight: "700" },
  extrabold: { fontWeight: "800" },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  brand: {
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};
