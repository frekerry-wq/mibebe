import React from "react";
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, GRADIENT, gradText, neonGlow, outline } from "../theme";
import { TL } from "../timeline";
import { ViceBackground } from "./Background";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Grano de película, scanlines VHS y viñeta */
export const FilmOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const ox = Math.floor(random(`gx${frame}`) * 512);
  const oy = Math.floor(random(`gy${frame}`) * 512);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile("img/noise.png")})`, backgroundPosition: `${ox}px ${oy}px`, opacity: 0.05 }} />
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(180deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 4px)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Subtítulos palabra a palabra */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const cap = TL.captions.find((c) => frame >= c.from && frame < c.to);
  if (!cap) return null;
  const local = frame - cap.from;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 1500,
          textAlign: "center",
          fontFamily: FONT.body,
          fontWeight: 900,
          fontSize: 50,
          lineHeight: 1.15,
          color: C.white,
          textShadow: outline(4, "#0a0418"),
          opacity: interpolate(local, [0, 3], [0, 1], clamp),
          translate: `0px ${interpolate(local, [0, 5], [10, 0], clamp)}px`,
        }}
      >
        {cap.words.map((w, i) => {
          const active = frame >= w.from && frame < (cap.words[i + 1]?.from ?? cap.to);
          const said = frame >= w.from;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: 14,
                color: active ? C.yellow : said ? C.white : "rgba(255,246,239,0.55)",
                scale: active ? "1.08" : "1",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Star: React.FC<{ on: boolean; size?: number }> = ({ on, size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"
      fill={on ? C.white : "rgba(255,255,255,0.12)"}
      stroke={on ? C.white : "rgba(255,255,255,0.45)"}
      strokeWidth={1.4}
    />
  </svg>
);

/** HUD: capítulo actual + "nivel de búsqueda" que sube con el avance */
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const segs = TL.segments;
  let idx = -1;
  segs.forEach((s, i) => {
    if (frame >= s.from) idx = i;
  });
  const inTitle = frame >= TL.title.from && frame < TL.title.from + TL.title.dur;
  if (idx <= 0 || inTitle || frame >= TL.endcard.from) return null;
  const seg = segs[idx];
  const inCard = seg.cardFrom !== null && frame < seg.cardFrom + seg.cardDur;
  if (inCard) return null;
  const stars = Math.min(5, Math.ceil((idx / (segs.length - 1)) * 5));
  const appear = interpolate(frame - (seg.cardFrom! + seg.cardDur), [0, 12], [0, 1], clamp);
  const prevStars = Math.min(5, Math.ceil(((idx - 1) / (segs.length - 1)) * 5));
  const blink = stars > prevStars && frame - (seg.cardFrom! + seg.cardDur) < 60 ? Math.floor(frame / 6) % 2 === 0 : true;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 56,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: appear,
          translate: `${interpolate(appear, [0, 1], [-30, 0])}px 0px`,
        }}
      >
        <div style={{ background: C.magenta, color: C.white, fontFamily: FONT.head, fontSize: 30, padding: "4px 14px", letterSpacing: 2 }}>{seg.chapter}</div>
        <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 26, color: C.white, textShadow: outline(2, "#0a0418"), textTransform: "uppercase", letterSpacing: 1 }}>{seg.title}</div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 52, display: "flex", gap: 4, opacity: appear, filter: "drop-shadow(0 2px 0 #000)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} on={i < stars && (i < prevStars || blink)} />
        ))}
      </div>
    </>
  );
};

/** Tarjeta de capítulo */
export const ChapterCard: React.FC<{ chapter: string; title: string; dur: number; variant: string }> = ({ chapter, title, dur, variant }) => {
  const frame = useCurrentFrame();
  const num = chapter.match(/\d+/)?.[0];
  const reveal = interpolate(frame, [6, 26], [0, 100], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const exit = interpolate(frame, [dur - 10, dur], [0, 1], clamp);
  const streak = interpolate(frame, [4, 30], [-600, 2200], { ...clamp, easing: Easing.bezier(0.5, 0, 0.2, 1) });
  const flash = interpolate(frame, [0, 6], [0.8, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, scale: `${1 + exit * 0.08}` }}>
      <ViceBackground variant={variant} dim={0.55} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(10,4,24,0.92) 0%, rgba(10,4,24,0.6) 55%, rgba(10,4,24,0.1) 100%)" }} />
      {num && (
        <div
          style={{
            position: "absolute",
            right: 90,
            top: 120,
            fontFamily: FONT.head,
            fontSize: 640,
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: `4px ${C.pink}`,
            opacity: interpolate(frame, [0, 18], [0, 0.55], clamp),
            translate: `${interpolate(frame, [0, 30], [120, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px 0px`,
          }}
        >
          {num.padStart(2, "0")}
        </div>
      )}
      <div style={{ position: "absolute", left: 140, top: 360, width: 1300 }}>
        <div
          style={{
            fontFamily: FONT.body,
            fontWeight: 900,
            fontSize: 40,
            letterSpacing: 14,
            color: C.yellow,
            opacity: interpolate(frame, [2, 12], [0, 1], clamp),
            translate: `${interpolate(frame, [2, 16], [-60, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px 0px`,
          }}
        >
          {chapter}
        </div>
        <div style={{ width: interpolate(frame, [4, 22], [0, 520], clamp), height: 8, background: GRADIENT, margin: "18px 0 22px" }} />
        <div
          style={{
            fontFamily: FONT.head,
            fontSize: 150,
            lineHeight: 0.95,
            textTransform: "uppercase",
            clipPath: `inset(0 ${100 - reveal}% 0 0)`,
            ...gradText(),
            filter: "drop-shadow(6px 6px 0 #0a0418)",
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ position: "absolute", top: 0, left: streak, width: 260, height: 1080, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)", rotate: "12deg" }} />
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash }} />
      {/* barras cinematográficas */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: interpolate(frame, [0, 10], [0, 90], clamp), background: "#000" }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, width: 1920, height: interpolate(frame, [0, 10], [0, 90], clamp), background: "#000" }} />
    </AbsoluteFill>
  );
};

/** Secuencia de título tras el gancho */
export const TitleSequence: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const shake = frame < 18 ? (random(`sh${frame}`) - 0.5) * interpolate(frame, [0, 18], [40, 0], clamp) : 0;
  const s = interpolate(frame, [0, 10], [1.6, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const scriptOn = interpolate(frame, [22, 40], [0, 1], clamp);
  const exit = interpolate(frame, [dur - 12, dur], [0, 1], clamp);
  const flicker = frame > 22 && frame < 44 ? (random(`fl${frame}`) > 0.35 ? 1 : 0.2) : 1;
  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      <ViceBackground variant="sunset" dim={0.15} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: `${shake}px ${shake * 0.6}px` }}>
        <div style={{ scale: `${s}`, display: "flex", flexDirection: "column", alignItems: "center", marginTop: -60 }}>
          <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: 38, letterSpacing: 22, color: C.white, textShadow: outline(3, "#0a0418"), marginBottom: -10 }}>GRAND THEFT AUTO</div>
          <div
            style={{
              fontFamily: FONT.head,
              fontSize: 360,
              lineHeight: 1,
              ...gradText(),
              filter: "drop-shadow(10px 10px 0 #0a0418)",
            }}
          >
            GTA 6
          </div>
          <div
            style={{
              fontFamily: FONT.script,
              fontSize: 150,
              color: "#fff",
              marginTop: -70,
              rotate: "-6deg",
              textShadow: neonGlow(C.magenta, 1.3),
              opacity: scriptOn * flicker,
            }}
          >
            La espera termina
          </div>
          <div style={{ marginTop: 26, fontFamily: FONT.body, fontWeight: 800, fontSize: 36, color: C.yellow, letterSpacing: 10, opacity: interpolate(frame, [40, 55], [0, 1], clamp) }}>
            19 · 11 · 2026
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(frame, [0, 8], [1, 0], clamp) }} />
    </AbsoluteFill>
  );
};

/** Pantalla final con espacio para elementos de YouTube */
export const EndCard: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const inn = interpolate(frame, [0, 20], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const out = interpolate(frame, [dur - 45, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <ViceBackground variant="sunset" dim={0.35} />
      <div style={{ position: "absolute", left: 120, top: 210, width: 760, opacity: inn, translate: `${(1 - inn) * -60}px 0px` }}>
        <div style={{ fontFamily: FONT.script, fontSize: 110, color: "#fff", textShadow: neonGlow(C.magenta, 1.2), rotate: "-5deg", marginBottom: 10 }}>Nos vemos en</div>
        <div style={{ fontFamily: FONT.head, fontSize: 170, lineHeight: 0.95, ...gradText(), filter: "drop-shadow(8px 8px 0 #0a0418)" }}>LEONIDA</div>
        <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 38, color: C.white, marginTop: 30, textShadow: outline(3, "#0a0418") }}>
          Suscríbete para guías, secretos
          <br />y todo sobre GTA 6
        </div>
      </div>
      {/* huecos para pantallas finales de YouTube */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 1010,
            top: 170 + i * 380,
            width: 640,
            height: 360,
            border: `4px solid ${i === 0 ? C.pink : C.teal}`,
            background: "rgba(10,4,24,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: interpolate(frame, [10 + i * 8, 28 + i * 8], [0, 1], clamp),
            scale: `${interpolate(frame, [10 + i * 8, 28 + i * 8], [0.9, 1], clamp)}`,
          }}
        >
          <div style={{ fontFamily: FONT.head, fontSize: 54, color: C.white, opacity: 0.85, letterSpacing: 3 }}>{i === 0 ? "MIRA ESTE VIDEO" : "TE VA A GUSTAR"}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
