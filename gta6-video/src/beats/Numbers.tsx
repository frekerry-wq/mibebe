import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ACCENT, C, FONT, gradText, neonGlow, outline } from "../theme";
import { BeatProps, clamp, ein, EASE, fmtNum, Label, Panel, shake, Stamp } from "./common";

const MC_GREEN = "#66cc33";

export const NumberBeat: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [0, 42], [0, p.value], { ...clamp, easing: Easing.bezier(0.1, 0.7, 0.2, 1) });
  const text = `${p.prefix ?? ""}${fmtNum(v)}${frame > 40 ? p.suffix ?? "" : ""}`;
  const finalLen = `${p.prefix ?? ""}${fmtNum(p.value)}${p.suffix ?? ""}`.length;
  const size = Math.min(250, 1700 / (finalLen * 0.52));
  const color = ACCENT[p.accent] ?? C.pink;
  const pulse = frame > 40 ? 1 + 0.04 * Math.exp(-(frame - 42) / 6) : 1;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.55)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", translate: "0px -30px" }}>
        <div style={{ fontFamily: FONT.head, fontSize: size, lineHeight: 1, color, scale: `${pulse}`, textShadow: `8px 8px 0 #0a0418, 0 0 50px ${color}66`, fontVariantNumeric: "tabular-nums" }}>{text}</div>
        <Label size={58} style={{ marginTop: 10, opacity: ein(frame, 6, 12) }}>
          {p.label}
        </Label>
        {p.sub && (
          <Label size={32} color={C.yellow} style={{ marginTop: 14, opacity: ein(frame, 16, 12), letterSpacing: 6 }}>
            {p.sub}
          </Label>
        )}
      </div>
    </AbsoluteFill>
  );
};

const ScoreBox: React.FC<{ value: number; size: number; delay?: number; label?: string }> = ({ value, size, delay = 0, label }) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [delay, delay + 22], [0, value], { ...clamp, easing: Easing.bezier(0.1, 0.7, 0.2, 1) }));
  const s = interpolate(frame, [delay, delay + 10], [0.4, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", scale: `${s}`, opacity: ein(frame, delay, 6) }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.12,
          background: `linear-gradient(160deg, #7fe04a, ${MC_GREEN} 50%, #3f9a17)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.body,
          fontWeight: 900,
          fontSize: size * 0.58,
          color: "#fff",
          textShadow: "0 6px 0 rgba(0,0,0,0.25)",
          boxShadow: `0 0 80px ${MC_GREEN}aa, 16px 16px 0 rgba(0,0,0,0.45)`,
        }}
      >
        {v}
      </div>
      {label && (
        <Label size={size * 0.13} style={{ marginTop: size * 0.08 }}>
          {label}
        </Label>
      )}
    </div>
  );
};

export const Score: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const sh = shake(frame, 2, 30, 14, "sc");
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "radial-gradient(circle, rgba(102,204,51,0.25), rgba(5,2,12,0.85) 60%)" }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 960,
            top: 500,
            width: 1400,
            height: 60,
            background: "linear-gradient(90deg, rgba(160,255,120,0.28), transparent)",
            rotate: `${i * 22.5 + frame * 0.6}deg`,
            transformOrigin: "0 50%",
            opacity: ein(frame, 30, 20),
          }}
        />
      ))}
      <div style={{ translate: `${sh.x}px ${sh.y - 40}px` }}>
        <ScoreBox value={p.value} size={380} label={p.label} />
      </div>
      {p.sub && (
        <Label size={36} color={C.yellow} style={{ position: "absolute", top: 860, opacity: ein(frame, 36, 10) }}>
          {p.sub}
        </Label>
      )}
    </AbsoluteFill>
  );
};

export const Versus: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(5,2,12,0.7)" }}>
      <Label size={42} color={C.yellow} style={{ position: "absolute", top: 150, opacity: ein(frame, 0, 10) }}>
        LOS MEJOR VALORADOS EN METACRITIC
      </Label>
      <div style={{ display: "flex", alignItems: "center", gap: 90, translate: "0px -10px" }}>
        <ScoreBox value={99} size={300} label={p.a} />
        <div style={{ fontFamily: FONT.head, fontSize: 200, color: C.white, opacity: ein(frame, 14, 8), textShadow: outline(5, "#0a0418") }}>=</div>
        <ScoreBox value={99} size={300} delay={10} label={p.b} />
      </div>
    </AbsoluteFill>
  );
};

export const Sentiment: React.FC<BeatProps> = () => {
  const frame = useCurrentFrame();
  const rows = [
    { l: "POSITIVAS", v: 100, c: MC_GREEN },
    { l: "MIXTAS", v: 0, c: C.yellow },
    { l: "NEGATIVAS", v: 0, c: C.red },
  ];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(5,2,12,0.65)" }}>
      <Panel style={{ width: 1300, padding: "50px 60px", translate: "0px -40px" }} border={MC_GREEN}>
        {rows.map((r, i) => {
          const w = interpolate(frame, [6 + i * 6, 36 + i * 6], [0, r.v], { ...clamp, easing: EASE });
          return (
            <div key={r.l} style={{ display: "flex", alignItems: "center", gap: 30, margin: "22px 0", opacity: ein(frame, i * 6, 8) }}>
              <div style={{ width: 300, fontFamily: FONT.head, fontSize: 64, color: C.white }}>{r.l}</div>
              <div style={{ flex: 1, height: 64, background: "rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ width: `${w}%`, height: "100%", background: r.c, boxShadow: `0 0 30px ${r.c}` }} />
              </div>
              <div style={{ width: 170, textAlign: "right", fontFamily: FONT.head, fontSize: 72, color: r.c }}>{Math.round(w)}%</div>
            </div>
          );
        })}
      </Panel>
    </AbsoluteFill>
  );
};

export const Views: React.FC<BeatProps> = ({ p, from }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [0, 60], [0, p.value], { ...clamp, easing: Easing.bezier(0.2, 0.6, 0.2, 1) });
  const stampAt = (p.stampAtFrame ?? from + 50) - from;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.6)" }}>
      <Panel style={{ width: 1360, padding: "50px 70px", translate: "0px -40px", position: "relative" }} border={C.red}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ width: 120, height: 84, borderRadius: 22, background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderLeft: "38px solid #fff", borderTop: "24px solid transparent", borderBottom: "24px solid transparent", marginLeft: 8 }} />
          </div>
          <Label size={44}>{p.label}</Label>
        </div>
        <div style={{ fontFamily: FONT.head, fontSize: 250, color: C.white, lineHeight: 1.05, marginTop: 10, fontVariantNumeric: "tabular-nums", textShadow: "8px 8px 0 #0a0418" }}>
          {fmtNum(v)}
          <span style={{ color: C.red }}>{frame > 58 ? "+" : ""}</span>
        </div>
        <Stamp text={p.stamp} at={stampAt} size={130} rotate={-12} color={C.yellow} style={{ right: -50, top: -90 }} />
      </Panel>
    </AbsoluteFill>
  );
};

export const Countdown: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  let time = p.time as string;
  if (p.ticking) {
    const secs = 23 * 3600 + 59 * 60 + 59 - Math.floor(frame / 30);
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  const colon = Math.floor(frame / 15) % 2 === 0;
  const display = p.ticking ? time : colon ? time : time.replace(":", " ");
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.5)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", translate: "0px -30px", scale: `${interpolate(frame, [0, 90], [1.0, 1.06], clamp)}` }}>
        <Label size={64} color={C.yellow} style={{ letterSpacing: 26, opacity: ein(frame, 0, 12) }}>
          {p.label}
        </Label>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: p.ticking ? 230 : 300,
            color: "#fff",
            lineHeight: 1.05,
            textShadow: neonGlow(C.magenta, 1.2),
            whiteSpace: "pre",
            opacity: ein(frame, 2, 10),
          }}
        >
          {display}
        </div>
        <div style={{ fontFamily: FONT.head, fontSize: 90, ...gradText(), opacity: ein(frame, 8, 12), letterSpacing: 6 }}>{p.date}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Years: React.FC<BeatProps> = ({ p, dur }) => {
  const frame = useCurrentFrame();
  const n = p.to - p.from + 1;
  const span = Math.min(dur - 10, 75);
  const i = Math.min(n - 1, Math.floor(interpolate(frame, [0, span], [0, n], clamp)));
  const year = p.from + i;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(5,2,12,0.75)" }}>
      <div style={{ display: "flex", gap: 22, position: "absolute", top: 230 }}>
        {Array.from({ length: n }).map((_, k) => (
          <div key={k} style={{ width: 120, height: 14, borderRadius: 7, background: k <= i ? C.pink : "rgba(255,255,255,0.15)" }} />
        ))}
      </div>
      <div style={{ fontFamily: FONT.head, fontSize: 360, color: "transparent", WebkitTextStroke: `5px ${C.white}`, lineHeight: 1, translate: "0px -20px" }}>{year}</div>
      <Label size={64} color={C.yellow} style={{ position: "absolute", top: 760, letterSpacing: 24, opacity: frame > 10 ? 0.6 + 0.4 * Math.sin(frame / 6) : 0 }}>
        {p.label}
      </Label>
    </AbsoluteFill>
  );
};

export const Bars: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const rows = [
    { l: "GTA V · PRIMER DÍA (2013)", v: 815, t: "$815 M", c: C.teal },
    { l: "GTA 6 · SOLO PREVENTAS", v: 1700, t: "~$1.700 M", c: C.green },
  ];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(2,10,6,0.7)" }}>
      <Label size={56} color={C.yellow} style={{ position: "absolute", top: 170, letterSpacing: 14 }}>
        {p.title}
      </Label>
      <div style={{ width: 1500, translate: "0px -10px" }}>
        {rows.map((r, i) => {
          const w = interpolate(frame, [8 + i * 14, 44 + i * 14], [0, r.v / 1800], { ...clamp, easing: EASE });
          return (
            <div key={i} style={{ margin: "40px 0", opacity: ein(frame, i * 14, 10) }}>
              <Label size={40} style={{ marginBottom: 12 }}>
                {r.l}
              </Label>
              <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
                <div style={{ width: `${w * 1150}px`, height: 110, background: `linear-gradient(90deg, ${r.c}88, ${r.c})`, borderRadius: 10, boxShadow: `0 0 40px ${r.c}88` }} />
                <div style={{ fontFamily: FONT.head, fontSize: 96, color: r.c, opacity: ein(frame, 30 + i * 14, 8) }}>{r.t}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Prices: React.FC<BeatProps> = () => {
  const frame = useCurrentFrame();
  const tags = [
    { l: "EDICIÓN ESTÁNDAR", v: "$79.99", c: C.teal },
    { l: "EDICIÓN ULTIMATE", v: "$99.99", c: C.gold },
  ];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.55)" }}>
      <div style={{ display: "flex", gap: 110, translate: "0px -40px" }}>
        {tags.map((t, i) => {
          const d = i * 22;
          const sw = Math.sin((frame - d) / 7) * 9 * Math.exp(-Math.max(0, frame - d) / 30);
          return (
            <div key={i} style={{ opacity: ein(frame, d, 8), translate: `0px ${interpolate(frame, [d, d + 14], [-300, 0], { ...clamp, easing: EASE })}px`, rotate: `${sw}deg`, transformOrigin: "50% -60px" }}>
              <div style={{ width: 4, height: 70, background: "#ddd", margin: "0 auto" }} />
              <div style={{ width: 560, padding: "40px 30px", background: "#fff", borderRadius: 24, border: `10px solid ${t.c}`, textAlign: "center", boxShadow: "16px 16px 0 rgba(0,0,0,0.45)" }}>
                <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: 38, color: C.ink, letterSpacing: 4 }}>{t.l}</div>
                <div style={{ fontFamily: FONT.head, fontSize: 190, color: C.ink, lineHeight: 1.05 }}>{t.v}</div>
                <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: "#7a5a9a" }}>USD</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Platforms: React.FC<BeatProps> = ({ p, from }) => {
  const frame = useCurrentFrame();
  const pcAt = (p.pcAtFrame ?? from + 60) - from;
  const chips = [
    { l: "PLAYSTATION 5", c: "#2f6bff", d: 0 },
    { l: "XBOX SERIES X|S", c: "#1fae4b", d: 12 },
  ];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.55)" }}>
      <Label size={44} color={C.yellow} style={{ position: "absolute", top: 180, letterSpacing: 14 }}>
        DISPONIBLE EN
      </Label>
      <div style={{ display: "flex", gap: 40, alignItems: "center", translate: "0px -30px" }}>
        {chips.map((c) => (
          <div
            key={c.l}
            style={{
              padding: "40px 56px",
              borderRadius: 24,
              background: c.c,
              fontFamily: FONT.head,
              fontSize: 96,
              color: "#fff",
              boxShadow: `0 0 50px ${c.c}aa, 12px 12px 0 rgba(0,0,0,0.45)`,
              opacity: ein(frame, c.d, 8),
              scale: `${interpolate(frame, [c.d, c.d + 10], [0.6, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })}`,
            }}
          >
            {c.l}
          </div>
        ))}
        <div style={{ position: "relative", opacity: frame >= pcAt ? 1 : 0 }}>
          <div style={{ padding: "40px 56px", borderRadius: 24, background: "#3a3346", fontFamily: FONT.head, fontSize: 96, color: "#8d84a0" }}>PC</div>
          <div style={{ position: "absolute", right: -46, top: -70, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.head, fontSize: 130, color: C.red, opacity: 0.9, scale: `${interpolate(frame, [pcAt, pcAt + 6], [2, 1], clamp)}`, textShadow: outline(5, "#0a0418") }}>
            ✕
          </div>
        </div>
      </div>
      <Label size={40} color={C.red} style={{ position: "absolute", top: 720, opacity: frame >= pcAt + 6 ? 1 : 0 }}>
        PC: SIN FECHA POR AHORA
      </Label>
    </AbsoluteFill>
  );
};

export const Storage: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [8, 60], [0, 0.93], { ...clamp, easing: EASE });
  const gb = Math.round(fill * 215);
  const warn = fill > 0.8 && Math.floor(frame / 8) % 2 === 0;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.6)" }}>
      <div style={{ width: 1400, translate: "0px -40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Label size={60}>PREPARA TU DISCO</Label>
          <div style={{ fontFamily: FONT.head, fontSize: 150, color: warn ? C.red : C.yellow, lineHeight: 1 }}>~{p.gb} GB</div>
        </div>
        <div style={{ marginTop: 24, height: 120, borderRadius: 16, border: `6px solid ${C.white}`, padding: 10, background: "rgba(0,0,0,0.4)" }}>
          <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${C.teal}, ${C.yellow} 60%, ${C.red})` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontFamily: FONT.mono, fontSize: 44, color: C.white }}>
          <span>ESPACIO NECESARIO</span>
          <span>{gb} GB</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
