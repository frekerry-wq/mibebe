import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import fonts from "./fonts.json";

// Fuentes de Google (Anton, Montserrat, Yellowtail, Share Tech Mono) servidas en local desde public/fonts
for (const f of fonts as { family: string; weight: string; file: string; unicodeRange: string }[]) {
  loadFont({ family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight, unicodeRange: f.unicodeRange, display: "block" });
}

export const FONT = {
  head: "Anton",
  body: "Montserrat",
  script: "Yellowtail",
  mono: "'Share Tech Mono'",
};

export const C = {
  night: "#0a0418",
  deep: "#1a0836",
  purple: "#5b1a8e",
  magenta: "#ff2d95",
  pink: "#ff5fa2",
  orange: "#ff8a3d",
  yellow: "#ffd166",
  teal: "#29e6d4",
  cyan: "#5ef2ff",
  red: "#ff3b4e",
  green: "#3ddc84",
  gold: "#ffc94a",
  white: "#fff6ef",
  ink: "#120821",
};

export const GRADIENT = `linear-gradient(180deg, ${C.yellow} 0%, ${C.orange} 38%, ${C.magenta} 72%, #b02bd6 100%)`;

export const ACCENT: Record<string, string> = {
  pink: C.pink,
  orange: C.orange,
  teal: C.teal,
  red: C.red,
  green: C.green,
  gold: C.gold,
  yellow: C.yellow,
  gradient: C.orange,
};

export const gradText = (bg: string = GRADIENT): React.CSSProperties => ({
  backgroundImage: bg,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  // amplía la caja para que las tildes (Á, Ñ, Ó) no queden fuera del área pintada
  paddingTop: "0.14em",
});

export const neonGlow = (color: string, strength = 1) =>
  `0 0 ${6 * strength}px ${color}, 0 0 ${18 * strength}px ${color}, 0 0 ${40 * strength}px ${color}`;

export const outline = (px = 4, color = "#000") =>
  [
    `${px}px 0 0 ${color}`,
    `-${px}px 0 0 ${color}`,
    `0 ${px}px 0 ${color}`,
    `0 -${px}px 0 ${color}`,
    `${px * 0.7}px ${px * 0.7}px 0 ${color}`,
    `-${px * 0.7}px ${px * 0.7}px 0 ${color}`,
    `${px * 0.7}px -${px * 0.7}px 0 ${color}`,
    `-${px * 0.7}px -${px * 0.7}px 0 ${color}`,
  ].join(", ");
