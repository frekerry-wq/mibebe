import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { ACCENT, C, FONT, GRADIENT, gradText, neonGlow, outline } from "../theme";
import { BeatProps, clamp, ein, EASE, Label, Panel, shake } from "./common";

const GOLD_GRAD = `linear-gradient(180deg, #fff6c8 0%, ${C.gold} 45%, #c46a00 100%)`;
const RED_GRAD = `linear-gradient(180deg, #ffd0d0 0%, ${C.red} 50%, #7a0010 100%)`;

export const Slam: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const lines: string[] = p.lines ?? [];
  const maxChars = Math.max(...lines.map((l) => l.length));
  const size = Math.max(130, Math.min(330, 1500 / (maxChars * 0.5)));
  const s = interpolate(frame, [0, 8], [1.7, 1], { ...clamp, easing: EASE });
  const sh = shake(frame, 2, 34, 12, "slam");
  const accent = ACCENT[p.accent] ?? C.pink;
  const glitchOn = p.glitch && (frame < 16 || random(`gl${Math.floor(frame / 3)}`) > 0.9);
  const gx = glitchOn ? (random(`gx${frame}`) - 0.5) * 30 : 0;
  const fill = (i: number): React.CSSProperties => {
    if (p.accent === "gradient") return gradText();
    if (p.accent === "gold") return gradText(GOLD_GRAD);
    if (p.accent === "red") return gradText(RED_GRAD);
    return i === 0 && lines.length > 1 ? { color: accent } : { color: i === 0 ? accent : C.white };
  };
  const text = (dx: number, color?: string, key?: string) => (
    <div key={key} style={{ position: color ? "absolute" : "relative", inset: color ? 0 : undefined, translate: `${dx}px 0px`, mixBlendMode: color ? "screen" : "normal", opacity: color ? 0.8 : 1 }}>
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONT.head,
            fontSize: i === 0 ? size : size * 0.62,
            lineHeight: 0.92,
            textAlign: "center",
            textTransform: "uppercase",
            ...(color ? { color } : fill(i)),
            filter: color ? undefined : "drop-shadow(8px 8px 0 #0a0418)",
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: p.dark ? "rgba(5,2,12,0.72)" : "rgba(10,4,24,0.35)" }}>
      <div style={{ scale: `${s}`, translate: `${sh.x}px ${sh.y - 30}px`, position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          {glitchOn && text(-gx - 8, "#00f0ff", "c")}
          {glitchOn && text(gx + 8, "#ff0055", "m")}
          {text(0)}
        </div>
        {p.script && (
          <div style={{ fontFamily: FONT.script, fontSize: size * 0.42, color: "#fff", marginTop: -size * 0.12, rotate: "-5deg", textShadow: neonGlow(C.magenta, 1.1), opacity: ein(frame, 8, 10) }}>
            {p.script}
          </div>
        )}
        {p.sub && (
          <Label size={46} color={C.yellow} style={{ marginTop: 24, opacity: ein(frame, 8, 10) }}>
            {p.sub}
          </Label>
        )}
      </div>
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(frame, [0, 5], [0.55, 0], clamp) }} />
    </AbsoluteFill>
  );
};

export const Year: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const target = parseInt(p.year, 10);
  const y = Math.round(interpolate(frame, [0, 24], [2026, target], { ...clamp, easing: EASE }));
  const rewinding = frame < 24;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.45)" }}>
      {rewinding && (
        <div style={{ position: "absolute", left: 120, top: 120, fontFamily: FONT.mono, fontSize: 60, color: C.white, textShadow: outline(3, "#000"), opacity: Math.floor(frame / 5) % 2 ? 1 : 0.4 }}>
          {"<< REBOBINANDO"}
        </div>
      )}
      <Label size={52} color={C.yellow} style={{ marginBottom: -10, opacity: ein(frame, 18, 10), letterSpacing: 20 }}>
        {p.label}
      </Label>
      <div style={{ fontFamily: FONT.head, fontSize: 380, lineHeight: 1, ...gradText(), filter: "drop-shadow(10px 10px 0 #0a0418)", translate: `${rewinding ? (random(`yr${frame}`) - 0.5) * 16 : 0}px 0px` }}>{y}</div>
    </AbsoluteFill>
  );
};

export const Speed: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const lines = Array.from({ length: 70 });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle, rgba(10,4,24,0.2), rgba(10,4,24,0.85))", overflow: "hidden" }}>
      {lines.map((_, i) => {
        const a = random(`a${i}`) * Math.PI * 2;
        const sp = 0.6 + random(`v${i}`) * 1.4;
        const d = ((frame * 38 * sp + random(`o${i}`) * 1200) % 1300) + 80;
        const len = 80 + d * 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 960 + Math.cos(a) * d,
              top: 540 + Math.sin(a) * d,
              width: len,
              height: 3,
              background: i % 3 === 0 ? C.pink : i % 3 === 1 ? C.yellow : "#fff",
              opacity: 0.55,
              rotate: `${a}rad`,
              transformOrigin: "0 50%",
            }}
          />
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontFamily: FONT.head, fontSize: 170, scale: `${interpolate(frame, [0, 60], [0.7, 1.15], clamp)}`, ...gradText(), filter: "drop-shadow(8px 8px 0 #0a0418)", textAlign: "center", lineHeight: 0.95 }}>{p.text}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Neon: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const on = frame < 18 ? (random(`n${frame}`) > 0.4 ? 1 : 0.15) : 0.92 + 0.08 * Math.sin(frame / 3);
  const long = (p.text as string).length > 14;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(5,2,12,0.6)" }}>
      <div
        style={{
          padding: "40px 90px",
          border: `5px solid ${C.teal}`,
          borderRadius: 40,
          boxShadow: `${neonGlow(C.teal, 0.8)}, inset 0 0 30px ${C.teal}66`,
          opacity: on,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          translate: "0px -30px",
        }}
      >
        <div style={{ fontFamily: FONT.script, fontSize: long ? 150 : 230, color: "#fff", rotate: "-4deg", textShadow: neonGlow(C.magenta, 1.4), whiteSpace: "nowrap" }}>{p.text}</div>
        {p.sub && <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: 40, letterSpacing: 16, color: C.teal, textShadow: neonGlow(C.teal, 0.6), marginTop: 10 }}>{p.sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

export const Postcard: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const letters = (p.main as string).toUpperCase().split("");
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.3)" }}>
      <div style={{ translate: "0px -30px", display: "flex", flexDirection: "column", alignItems: "center", rotate: `${interpolate(frame, [0, 20], [-8, -3], { ...clamp, easing: EASE })}deg` }}>
        <div style={{ fontFamily: FONT.script, fontSize: 120, color: "#fff", textShadow: neonGlow(C.magenta, 1), marginBottom: -50, zIndex: 2, opacity: ein(frame, 0, 12) }}>Bienvenidos a</div>
        <div style={{ display: "flex" }}>
          {letters.map((l, i) => (
            <div
              key={i}
              style={{
                fontFamily: FONT.head,
                fontSize: 300,
                lineHeight: 1,
                ...gradText(GRADIENT),
                WebkitTextStroke: "6px #0a0418",
                filter: "drop-shadow(10px 10px 0 #0a0418)",
                translate: `0px ${interpolate(frame, [4 + i * 3, 16 + i * 3], [160, 0], { ...clamp, easing: EASE })}px`,
                opacity: ein(frame, 4 + i * 3, 8),
              }}
            >
              {l}
            </div>
          ))}
        </div>
        <Label size={40} color={C.yellow} style={{ marginTop: 10, letterSpacing: 18, opacity: ein(frame, 26, 12) }}>
          EL ESTADO DEL SOL
        </Label>
      </div>
    </AbsoluteFill>
  );
};

export const Quote: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const words = (p.text as string).split(" ");
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.6)" }}>
      <div style={{ width: 1400, translate: "0px -40px", position: "relative" }}>
        <div style={{ position: "absolute", left: -110, top: -150, fontFamily: FONT.head, fontSize: 380, color: C.pink, opacity: 0.8 * ein(frame, 0, 10) }}>“</div>
        <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: 82, lineHeight: 1.12, color: C.white, textShadow: outline(4, "#0a0418") }}>
          {words.map((w, i) => (
            <span key={i} style={{ opacity: ein(frame, 2 + i * 2, 6), display: "inline-block", marginRight: 22 }}>
              {w}
            </span>
          ))}
        </div>
        <Label size={36} color={C.yellow} style={{ marginTop: 34, opacity: ein(frame, 20, 10) }}>
          — {p.source}
        </Label>
      </div>
    </AbsoluteFill>
  );
};

export const Statement: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const inn = ein(frame, 0, 16);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.45)" }}>
      <Panel style={{ width: 1300, padding: "56px 70px", translate: `0px ${(1 - inn) * 80 - 40}px`, opacity: inn, position: "relative" }} border={C.teal}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: C.teal, boxShadow: neonGlow(C.teal, 0.5) }} />
          <Label size={34} color={C.teal}>
            {p.kicker}
          </Label>
        </div>
        <div style={{ fontFamily: FONT.head, fontSize: 150, lineHeight: 1.05, marginTop: 18, ...gradText() }}>{p.title}</div>
        <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 56, color: C.white, lineHeight: 1.2, marginTop: 10, opacity: ein(frame, 10, 12) }}>{p.body}</div>
      </Panel>
    </AbsoluteFill>
  );
};

export const Breaking: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const inn = ein(frame, 0, 12);
  const ticker = "ÚLTIMA HORA  ·  GTA 6  ·  " + (p.headline as string) + "  ·  " + (p.sub as string) + "  ·  ";
  return (
    <AbsoluteFill style={{ background: "rgba(10,4,24,0.55)" }}>
      <div style={{ position: "absolute", left: 140, top: 250, width: 1640, translate: `${(1 - inn) * -200}px 0px`, opacity: inn }}>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div style={{ background: C.red, color: "#fff", fontFamily: FONT.head, fontSize: 64, padding: "10px 36px", letterSpacing: 4 }}>{p.kicker}</div>
          <div style={{ background: "#fff", color: C.ink, fontFamily: FONT.body, fontWeight: 900, fontSize: 40, padding: "0 30px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 20, height: 20, borderRadius: 10, background: C.red, opacity: Math.floor(frame / 10) % 2 ? 1 : 0.25 }} />
            EN VIVO
          </div>
        </div>
        <div style={{ background: "linear-gradient(90deg, #ffffff, #f1e6ff)", padding: "26px 40px 30px", boxShadow: "14px 14px 0 rgba(0,0,0,0.45)" }}>
          <div style={{ fontFamily: FONT.head, fontSize: 116, lineHeight: 1.02, paddingTop: 16, color: C.ink, clipPath: `inset(0 ${100 - ein(frame, 6, 18) * 100}% 0 0)` }}>{p.headline}</div>
          <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 44, color: "#5b1a8e", marginTop: 8, opacity: ein(frame, 16, 10) }}>{p.sub}</div>
        </div>
        <div style={{ background: C.ink, borderTop: `4px solid ${C.red}`, height: 70, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 12, left: 0, whiteSpace: "nowrap", fontFamily: FONT.body, fontWeight: 800, fontSize: 38, color: C.yellow, translate: `${-((frame * 7) % 1600)}px 0px` }}>
            {ticker.repeat(4)}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
