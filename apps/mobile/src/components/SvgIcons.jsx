import React from "react";
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
  Polygon,
  Polyline,
  Line,
  ClipPath,
} from "react-native-svg";

// ─────────────────────────────────────────────
// TEXA CUSTOM SVG ICON SYSTEM
// ─────────────────────────────────────────────

export const TxIcon = ({ name, size = 24, color = "#111", style }) => {
  const icons = {
    // Navigation Icons
    home: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <Path
          d="M9 22V12h6v10"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    ),
    homeFill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
          fill={color}
        />
        <Path
          d="M9 22V12h6v10"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    ),
    play: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Rect
          x="2"
          y="3"
          width="8"
          height="18"
          rx="1.5"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Rect
          x="14"
          y="3"
          width="8"
          height="18"
          rx="1.5"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
      </Svg>
    ),
    playFill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Rect x="2" y="3" width="8" height="18" rx="1.5" fill={color} />
        <Rect x="14" y="3" width="8" height="18" rx="1.5" fill={color} />
      </Svg>
    ),
    chat: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <Path
          d="M8 10h8M8 14h5"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </Svg>
    ),
    chatFill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          fill={color}
        />
        <Path
          d="M8 10h8M8 14h5"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </Svg>
    ),
    mic: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Rect
          x="9"
          y="2"
          width="6"
          height="11"
          rx="3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d="M5 10a7 7 0 0014 0"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <Line
          x1="12"
          y1="21"
          x2="12"
          y2="17"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <Line
          x1="9"
          y1="21"
          x2="15"
          y2="21"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    ),
    micFill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Rect x="9" y="2" width="6" height="11" rx="3" fill={color} />
        <Path
          d="M5 10a7 7 0 0014 0"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <Line
          x1="12"
          y1="21"
          x2="12"
          y2="17"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <Line
          x1="9"
          y1="21"
          x2="15"
          y2="21"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    ),
    user: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle
          cx="12"
          cy="8"
          r="4"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    ),
    userFill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle cx="12" cy="8" r="4" fill={color} />
        <Path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    ),

    // Action Icons
    heart: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    heartFill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
          fill={color}
        />
      </Svg>
    ),
    comment: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    share: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle
          cx="18"
          cy="5"
          r="3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Circle
          cx="6"
          cy="12"
          r="3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Circle
          cx="18"
          cy="19"
          r="3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Line
          x1="8.59"
          y1="13.51"
          x2="15.42"
          y2="17.49"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <Line
          x1="15.41"
          y1="6.51"
          x2="8.59"
          y2="10.49"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </Svg>
    ),
    bookmark: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    bookmarkFill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
          fill={color}
        />
      </Svg>
    ),
    send: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Line
          x1="22"
          y1="2"
          x2="11"
          y2="13"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <Polygon
          points="22 2 15 22 11 13 2 9 22 2"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    plus: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Line
          x1="12"
          y1="5"
          x2="12"
          y2="19"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="5"
          y1="12"
          x2="19"
          y2="12"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    ),
    close: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Line
          x1="18"
          y1="6"
          x2="6"
          y2="18"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="6"
          y1="6"
          x2="18"
          y2="18"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    ),
    back: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M19 12H5M12 5l-7 7 7 7"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    search: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle
          cx="11"
          cy="11"
          r="7"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Line
          x1="21"
          y1="21"
          x2="16.65"
          y2="16.65"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    ),
    settings: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle
          cx="12"
          cy="12"
          r="3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
      </Svg>
    ),
    bell: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    bellFill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" fill={color} />
        <Path
          d="M13.73 21a2 2 0 01-3.46 0"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    ),
    store: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <Line
          x1="3"
          y1="6"
          x2="21"
          y2="6"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <Path
          d="M16 10a4 4 0 01-8 0"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    ),
    bag: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="1.8" />
        <Path
          d="M16 10a4 4 0 01-8 0"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    ),
    cart: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle cx="9" cy="21" r="1" fill={color} />
        <Circle cx="20" cy="21" r="1" fill={color} />
        <Path
          d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    star: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    starFill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          fill={color}
        />
      </Svg>
    ),
    camera: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <Circle
          cx="12"
          cy="13"
          r="4"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
      </Svg>
    ),
    image: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
        <Polyline
          points="21 15 16 10 5 21"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    phone: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82 19.79 19.79 0 01.09 1.2 2 2 0 012.08 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.18 7.87a16 16 0 006 6l1.23-1.23a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    video: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polygon
          points="23 7 16 12 23 17 23 7"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <Rect
          x="1"
          y="5"
          width="15"
          height="14"
          rx="2"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
      </Svg>
    ),
    music: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M9 18V5l12-2v13"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx="6"
          cy="18"
          r="3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Circle
          cx="18"
          cy="16"
          r="3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
      </Svg>
    ),
    edit: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    trash: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polyline
          points="3 6 5 6 21 6"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <Path
          d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    lock: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Rect
          x="3"
          y="11"
          width="18"
          height="11"
          rx="2"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d="M7 11V7a5 5 0 0110 0v4"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx="12" cy="16" r="1" fill={color} />
      </Svg>
    ),
    unlock: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Rect
          x="3"
          y="11"
          width="18"
          height="11"
          rx="2"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d="M7 11V7a5 5 0 019.9-1"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    ),
    shield: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <Path
          d="M9 12l2 2 4-4"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    eye: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Circle
          cx="12"
          cy="12"
          r="3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
      </Svg>
    ),
    eyeOff: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <Line
          x1="1"
          y1="1"
          x2="23"
          y2="23"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    ),
    globe: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.6" />
        <Path
          d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
          stroke={color}
          strokeWidth="1.6"
          fill="none"
        />
      </Svg>
    ),
    logout: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <Polyline
          points="16 17 21 12 16 7"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Line
          x1="21"
          y1="12"
          x2="9"
          y2="12"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    ),
    check: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polyline
          points="20 6 9 17 4 12"
          stroke={color}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    checkCircle: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M22 11.08V12a10 10 0 11-5.93-9.14"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <Polyline
          points="22 4 12 14.01 9 11.01"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    checkDouble: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polyline
          points="17 6 9 15 6 12"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Polyline
          points="23 6 15 15 12 12"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    info: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Line
          x1="12"
          y1="16"
          x2="12"
          y2="12"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="12"
          y1="8"
          x2="12.01"
          y2="8"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>
    ),
    help: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <Line
          x1="12"
          y1="17"
          x2="12.01"
          y2="17"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>
    ),
    chevronRight: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polyline
          points="9 18 15 12 9 6"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    chevronDown: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polyline
          points="6 9 12 15 18 9"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    more: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle cx="12" cy="5" r="1.5" fill={color} />
        <Circle cx="12" cy="12" r="1.5" fill={color} />
        <Circle cx="12" cy="19" r="1.5" fill={color} />
      </Svg>
    ),
    moreH: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle cx="5" cy="12" r="1.5" fill={color} />
        <Circle cx="12" cy="12" r="1.5" fill={color} />
        <Circle cx="19" cy="12" r="1.5" fill={color} />
      </Svg>
    ),
    coin: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle
          cx="12"
          cy="12"
          r="9"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d="M14.5 9.5a2.5 2.5 0 00-5 0c0 1.4 1 2 2.5 2.5s2.5 1.1 2.5 2.5a2.5 2.5 0 01-5 0"
          stroke={color}
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <Line
          x1="12"
          y1="7"
          x2="12"
          y2="8.5"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <Line
          x1="12"
          y1="15.5"
          x2="12"
          y2="17"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </Svg>
    ),
    zap: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polygon
          points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    zapFill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color} />
      </Svg>
    ),
    award: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle
          cx="12"
          cy="8"
          r="6"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    volume: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polygon
          points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <Path
          d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    ),
    volumeOff: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polygon
          points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <Line
          x1="23"
          y1="9"
          x2="17"
          y2="15"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="17"
          y1="9"
          x2="23"
          y2="15"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    ),
    rotate: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M1 4v6h6"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M23 20v-6h-6"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    sparkle: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M12 2l2.4 7.2H22l-6.4 4.8 2.4 7.2L12 17l-6 4.2 2.4-7.2L2 9.2h7.6L12 2z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    sparkleFill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M12 2l2.4 7.2H22l-6.4 4.8 2.4 7.2L12 17l-6 4.2 2.4-7.2L2 9.2h7.6L12 2z"
          fill={color}
        />
      </Svg>
    ),
    package: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Polyline
          points="3.27 6.96 12 12.01 20.73 6.96"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Line
          x1="12"
          y1="22.08"
          x2="12"
          y2="12"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    ),
    truck: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Rect
          x="1"
          y="3"
          width="15"
          height="13"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <Polygon
          points="16 8 20 8 23 11 23 16 16 16 16 8"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <Circle
          cx="5.5"
          cy="18.5"
          r="2.5"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Circle
          cx="18.5"
          cy="18.5"
          r="2.5"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
      </Svg>
    ),
    filter: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Polygon
          points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    users: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <Circle
          cx="9"
          cy="7"
          r="4"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    ),
    userPlus: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <Circle
          cx="8.5"
          cy="7"
          r="4"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Line
          x1="20"
          y1="8"
          x2="20"
          y2="14"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="17"
          y1="11"
          x2="23"
          y2="11"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    ),
    data: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Ellipse
          cx="12"
          cy="5"
          rx="9"
          ry="3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
      </Svg>
    ),
    map: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Circle
          cx="12"
          cy="10"
          r="3"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
      </Svg>
    ),
    language: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M3 5h12M9 3v2m4.8 9.8L13 13m2.5-8.5l3 8.5M3 19l2-4 2 4M5 17h4"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Line
          x1="13"
          y1="5"
          x2="13"
          y2="21"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    ),
    sun: (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle
          cx="12"
          cy="12"
          r="5"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
        <Line
          x1="12"
          y1="1"
          x2="12"
          y2="3"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="12"
          y1="21"
          x2="12"
          y2="23"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="4.22"
          y1="4.22"
          x2="5.64"
          y2="5.64"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="18.36"
          y1="18.36"
          x2="19.78"
          y2="19.78"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="1"
          y1="12"
          x2="3"
          y2="12"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="21"
          y1="12"
          x2="23"
          y2="12"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="4.22"
          y1="19.78"
          x2="5.64"
          y2="18.36"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="18.36"
          y1="5.64"
          x2="19.78"
          y2="4.22"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    ),
  };

  return (
    icons[name] || (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="1.8"
          fill="none"
        />
      </Svg>
    )
  );
};

// Reaction Icons (replaces emojis)
export const TxReaction = ({ name, size = 28 }) => {
  const reactions = {
    like: (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Defs>
          <LinearGradient id="likeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B35" />
            <Stop offset="100%" stopColor="#FF1493" />
          </LinearGradient>
        </Defs>
        <Circle cx="16" cy="16" r="16" fill="url(#likeGrad)" />
        <Path
          d="M22 12.5a4.5 4.5 0 00-6.36 0L16 12.14l-.64-.64a4.5 4.5 0 00-6.36 6.36L16 25l7-7.14a4.5 4.5 0 000-6.36z"
          fill="#fff"
        />
      </Svg>
    ),
    love: (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Defs>
          <LinearGradient id="loveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF1493" />
            <Stop offset="100%" stopColor="#FF69B4" />
          </LinearGradient>
        </Defs>
        <Circle cx="16" cy="16" r="16" fill="url(#loveGrad)" />
        <Path
          d="M22.5 11a5 5 0 00-7.07 0L16 11.43l-.43-.43a5 5 0 00-7.07 7.07L16 26l7.5-7.93A5 5 0 0022.5 11z"
          fill="#fff"
        />
        <Circle cx="22" cy="10" r="3" fill="#fff" opacity="0.5" />
      </Svg>
    ),
    fire: (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Defs>
          <LinearGradient id="fireGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF4500" />
            <Stop offset="100%" stopColor="#FFD700" />
          </LinearGradient>
        </Defs>
        <Circle cx="16" cy="16" r="16" fill="url(#fireGrad)" />
        <Path
          d="M16 7c0 0-1 3-3 5s-3 4-1 7c1 2 4 3 4 3s-2-3 0-5c1-1.5 3-1 3-1s-1 4 2 6c1.5 1 2 2 1 3 3-1 5-4 4-7-1-2-3-2-2-5-2 1-3 3-3 5-1-2-1-5 1-7s1-4-1-4z"
          fill="#fff"
        />
      </Svg>
    ),
    wow: (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Circle cx="16" cy="16" r="16" fill="#FFD700" />
        <Circle cx="11" cy="13" r="2.5" fill="#333" />
        <Circle cx="21" cy="13" r="2.5" fill="#333" />
        <Circle cx="12" cy="12" r="1" fill="#fff" />
        <Circle cx="22" cy="12" r="1" fill="#fff" />
        <Ellipse cx="16" cy="20" rx="4" ry="5" fill="#333" />
        <Ellipse cx="16" cy="21" rx="2.5" ry="3" fill="#CC0000" />
      </Svg>
    ),
    sad: (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Circle cx="16" cy="16" r="16" fill="#FFD700" />
        <Circle cx="11" cy="13" r="2.5" fill="#333" />
        <Circle cx="21" cy="13" r="2.5" fill="#333" />
        <Circle cx="12" cy="12" r="1" fill="#fff" />
        <Circle cx="22" cy="12" r="1" fill="#fff" />
        <Path
          d="M10 22c1.5-3 10.5-3 12 0"
          stroke="#333"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M9 24c0-1 1-1.5 1.5-1L12 24"
          stroke="#5bc8f5"
          strokeWidth="1.5"
          fill="none"
        />
      </Svg>
    ),
    laugh: (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Circle cx="16" cy="16" r="16" fill="#FFD700" />
        <Circle cx="11" cy="12" r="3" fill="#333" />
        <Circle cx="21" cy="12" r="3" fill="#333" />
        <Circle cx="12" cy="11" r="1.2" fill="#fff" />
        <Circle cx="22" cy="11" r="1.2" fill="#fff" />
        <Path d="M8 19c2 5 14 5 16 0" fill="#333" />
        <Path
          d="M8 19c2 5 14 5 16 0"
          fill="none"
          stroke="#333"
          strokeWidth="0.5"
        />
        <Ellipse cx="16" cy="21" rx="4" ry="2" fill="#CC0000" />
        <Path d="M13 20c1 2 6 2 6 0" fill="#FF6B6B" />
      </Svg>
    ),
    clap: (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Defs>
          <LinearGradient id="clapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="100%" stopColor="#FFA500" />
          </LinearGradient>
        </Defs>
        <Circle cx="16" cy="16" r="16" fill="url(#clapGrad)" />
        <Path
          d="M14 8l1 4M18 8l-1 4M12 9l2 4M16 12c0 0-5 3-5 8s4 7 4 7"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M16 12l5 5c1 1 1 3-1 4L16 27c-3-2-6-6-5-10"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    ),
    gift: (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Defs>
          <LinearGradient id="giftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#9B2FAD" />
            <Stop offset="100%" stopColor="#FF6B35" />
          </LinearGradient>
        </Defs>
        <Circle cx="16" cy="16" r="16" fill="url(#giftGrad)" />
        <Rect
          x="7"
          y="14"
          width="18"
          height="12"
          rx="1"
          fill="#fff"
          opacity="0.9"
        />
        <Rect x="6" y="11" width="20" height="5" rx="1" fill="#fff" />
        <Line
          x1="16"
          y1="11"
          x2="16"
          y2="26"
          stroke="#FF6B35"
          strokeWidth="2"
        />
        <Path d="M16 11c0 0-3-4 0-4s0 4 0 4" fill="#FF6B35" />
        <Path
          d="M16 11c0 0 3-4 0-4"
          fill="none"
          stroke="#FF6B35"
          strokeWidth="1.5"
        />
      </Svg>
    ),
  };
  return reactions[name] || reactions.like;
};

// Notification Type Icons
export const TxNotifIcon = ({ type, size = 40 }) => {
  const configs = {
    like: { bg: "#FFF0EB", icon: "heartFill", color: "#FF6B35" },
    comment: { bg: "#F0F0FF", icon: "comment", color: "#6B35FF" },
    follow: { bg: "#E8F8EE", icon: "userPlus", color: "#34C759" },
    mention: { bg: "#FFF5E0", icon: "sparkle", color: "#FFD700" },
    message: { bg: "#E5F0FF", icon: "chat", color: "#007AFF" },
    order: { bg: "#E8F8EE", icon: "package", color: "#34C759" },
    system: { bg: "#F5F5F7", icon: "info", color: "#555" },
    review: { bg: "#FFF5E0", icon: "star", color: "#F5A623" },
    follow_request: { bg: "#F0F0FF", icon: "users", color: "#6B35FF" },
  };
  const cfg = configs[type] || configs.system;
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Rect x="0" y="0" width="40" height="40" rx="12" fill={cfg.bg} />
    </Svg>
  );
};

// Empty State Illustrations
export const TxEmptyState = ({ type, size = 120 }) => {
  const states = {
    messages: (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx="60" cy="60" r="50" fill="#F5F5F7" />
        <Rect x="25" y="35" width="70" height="50" rx="10" fill="#E5E5EA" />
        <Rect x="35" y="50" width="30" height="6" rx="3" fill="#C7C7CC" />
        <Rect x="35" y="62" width="20" height="6" rx="3" fill="#D1D1D6" />
        <Path d="M25 85l10 15 5-10" fill="#E5E5EA" />
      </Svg>
    ),
    notifications: (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx="60" cy="60" r="50" fill="#F5F5F7" />
        <Path
          d="M60 25c-17 0-28 13-28 28v12l-7 9h70l-7-9V53c0-15-11-28-28-28z"
          fill="#E5E5EA"
        />
        <Rect x="52" y="74" width="16" height="10" rx="5" fill="#C7C7CC" />
        <Circle cx="60" cy="35" r="8" fill="#FF6B35" opacity="0.2" />
        <Circle cx="60" cy="35" r="5" fill="#FF6B35" />
      </Svg>
    ),
    cart: (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx="60" cy="60" r="50" fill="#F5F5F7" />
        <Path
          d="M25 35h10l15 40h30l10-28H40"
          stroke="#C7C7CC"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx="52" cy="82" r="6" fill="#C7C7CC" />
        <Circle cx="72" cy="82" r="6" fill="#C7C7CC" />
      </Svg>
    ),
    posts: (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx="60" cy="60" r="50" fill="#F5F5F7" />
        <Rect x="30" y="35" width="60" height="50" rx="8" fill="#E5E5EA" />
        <Circle cx="44" cy="52" r="8" fill="#C7C7CC" />
        <Path d="M30 70l20-15 20 15 10-12 10 12" fill="#D1D1D6" />
      </Svg>
    ),
    store: (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx="60" cy="60" r="50" fill="#F5F5F7" />
        <Path d="M30 50l5-15h50l5 15H30z" fill="#E5E5EA" />
        <Rect x="28" y="50" width="64" height="40" rx="4" fill="#D1D1D6" />
        <Rect x="45" y="65" width="30" height="25" rx="4" fill="#E5E5EA" />
        <Path
          d="M30 50c0 5 4 10 10 10s10-5 10-10"
          stroke="#C7C7CC"
          strokeWidth="2"
          fill="none"
        />
        <Path
          d="M50 50c0 5 4 10 10 10s10-5 10-10"
          stroke="#C7C7CC"
          strokeWidth="2"
          fill="none"
        />
        <Path
          d="M70 50c0 5 4 10 10 10s10-5 10-10"
          stroke="#C7C7CC"
          strokeWidth="2"
          fill="none"
        />
      </Svg>
    ),
  };
  return states[type] || states.posts;
};

export default TxIcon;
