import React from "react";
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, outline } from "../theme";

export type BeatProps = { p: Record<string, any>; dur: number; from: number };

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** 0→1 con easing suave a partir de `start` durante `len` frames */
export const ein = (frame: number, start = 0, len = 14) => interpolate(frame, [start, start + len], [0, 1], { ...clamp, easing: EASE });

export const useSpring = (delay = 0, damping = 14, stiffness = 180) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness, mass: 0.8 } });
};

/** sacudida de cámara que decae */
export const shake = (frame: number, start: number, amp = 26, len = 14, seed = "s") => {
  const t = frame - start;
  if (t < 0 || t > len) return { x: 0, y: 0 };
  const k = 1 - t / len;
  return { x: (random(`${seed}x${frame}`) - 0.5) * amp * k, y: (random(`${seed}y${frame}`) - 0.5) * amp * k };
};

export const fmtNum = (n: number) => Math.round(n).toLocaleString("es-ES").replace(/,/g, ".").replace(/ /g, ".");

export const Stamp: React.FC<{ text: string; color?: string; at: number; size?: number; rotate?: number; style?: React.CSSProperties }> = ({
  text,
  color = C.red,
  at,
  size = 120,
  rotate = -12,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const s = interpolate(t, [0, 6], [2.4, 1], { ...clamp, easing: Easing.bezier(0.5, 0, 0.75, 0) });
  const o = interpolate(t, [0, 3], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        fontFamily: FONT.head,
        fontSize: size,
        color,
        border: `${size * 0.07}px solid ${color}`,
        padding: `${size * 0.02}px ${size * 0.18}px`,
        rotate: `${rotate}deg`,
        scale: `${s}`,
        opacity: o * 0.92,
        letterSpacing: size * 0.04,
        mixBlendMode: "normal",
        textShadow: "0 0 2px rgba(0,0,0,0.3)",
        background: "rgba(10,4,24,0.25)",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = C.white, size = 44, style }) => (
  <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: size, color, letterSpacing: size * 0.12, textShadow: outline(3, "#0a0418"), textTransform: "uppercase", ...style }}>
    {children}
  </div>
);

export const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; border?: string }> = ({ children, style, border = C.pink }) => (
  <div
    style={{
      background: "linear-gradient(160deg, rgba(26,8,54,0.92), rgba(10,4,24,0.92))",
      border: `3px solid ${border}`,
      boxShadow: `0 0 0 6px rgba(10,4,24,0.5), 0 0 40px ${border}55, 14px 14px 0 rgba(0,0,0,0.45)`,
      borderRadius: 18,
      ...style,
    }}
  >
    {children}
  </div>
);

/** silueta genérica de persona (busto) */
export const Silhouette: React.FC<{ hair?: "long" | "short" | "hood"; color?: string; rim?: string; size?: number }> = ({ hair = "short", color = "#0a0418", rim = C.pink, size = 420 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <defs>
      <linearGradient id={`g-${hair}-${rim}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={rim} stopOpacity="0.55" />
        <stop offset="1" stopColor={color} stopOpacity="1" />
      </linearGradient>
    </defs>
    {hair === "long" && <path d="M64 70 C60 30, 140 30, 136 70 L142 140 C120 150, 80 150, 58 140 Z" fill={`url(#g-${hair}-${rim})`} stroke={rim} strokeWidth="2" />}
    {hair === "hood" && <path d="M54 80 C50 20, 150 20, 146 80 L150 130 L50 130 Z" fill={`url(#g-${hair}-${rim})`} stroke={rim} strokeWidth="2" />}
    <ellipse cx="100" cy="72" rx="30" ry="36" fill={`url(#g-${hair}-${rim})`} stroke={rim} strokeWidth="2.5" />
    {hair === "short" && <path d="M70 62 C70 30, 130 30, 130 62 C122 48, 80 48, 70 62 Z" fill={rim} opacity="0.6" />}
    <path d="M30 200 C34 140, 70 118, 100 118 C130 118, 166 140, 170 200 Z" fill={`url(#g-${hair}-${rim})`} stroke={rim} strokeWidth="2.5" />
  </svg>
);
