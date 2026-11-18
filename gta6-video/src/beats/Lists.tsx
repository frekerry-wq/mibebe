import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, gradText, outline } from "../theme";
import { BeatProps, clamp, ein, EASE, Label, Panel, Silhouette, Stamp } from "./common";

type Item = { text: string; frame?: number };

const rel = (it: Item, from: number, i: number) => (it.frame ?? from + i * 20) - from;

export const List: React.FC<BeatProps> = ({ p, from }) => {
  const frame = useCurrentFrame();
  const items: Item[] = p.items ?? [];
  const v = p.variant as string;

  if (v === "stamps") {
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.6)" }}>
        <Label size={50} color={C.yellow} style={{ position: "absolute", top: 170, letterSpacing: 10 }}>
          {p.title}
        </Label>
        <div style={{ display: "flex", gap: 70, translate: "0px -10px" }}>
          {items.map((it, i) => {
            const at = rel(it, from, i);
            const last = i === items.length - 1;
            return (
              <div key={i} style={{ position: "relative", width: 480, height: 300, display: "flex", alignItems: "center", justifyContent: "center", opacity: frame >= at - 2 ? 1 : 0 }}>
                <div style={{ fontFamily: FONT.head, fontSize: last ? 190 : 130, color: last ? C.red : C.white, textShadow: outline(5, "#0a0418"), scale: `${interpolate(frame, [at, at + 6], [1.6, 1], clamp)}` }}>{it.text}</div>
                {!last && <Stamp text="✕" at={at + 4} size={220} color={C.red} rotate={0} style={{ border: "none", background: "transparent", padding: 0 }} />}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  if (v === "rumors") {
    const notes = items.slice(0, -1);
    const last = items[items.length - 1];
    return (
      <AbsoluteFill style={{ background: "rgba(10,4,24,0.55)" }}>
        {notes.map((it, i) => {
          const at = rel(it, from, i);
          const x = 360 + i * 640;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: 250 + i * 60,
                width: 520,
                padding: "50px 40px",
                background: i % 2 ? "#ffe680" : "#ff9fc8",
                rotate: `${i % 2 ? 6 : -7}deg`,
                boxShadow: "14px 14px 0 rgba(0,0,0,0.45)",
                fontFamily: FONT.head,
                fontSize: 120,
                color: C.ink,
                textAlign: "center",
                opacity: ein(frame, at, 6),
                scale: `${interpolate(frame, [at, at + 8], [0.6, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })}`,
              }}
            >
              {it.text}
            </div>
          );
        })}
        {last && <Stamp text={last.text} at={rel(last, from, 2)} size={260} rotate={-10} style={{ left: 640, top: 340 }} />}
      </AbsoluteFill>
    );
  }

  if (v === "quotes") {
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.6)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 50, translate: "0px -40px" }}>
          {items.map((it, i) => {
            const at = rel(it, from, i);
            const [outlet, quote] = it.text.split("|");
            return (
              <Panel
                key={i}
                border={i === 0 ? C.red : C.teal}
                style={{
                  width: 1300,
                  padding: "34px 50px",
                  display: "flex",
                  alignItems: "center",
                  gap: 50,
                  opacity: ein(frame, at, 8),
                  translate: `${interpolate(frame, [at, at + 12], [i % 2 ? 300 : -300, 0], { ...clamp, easing: EASE })}px 0px`,
                }}
              >
                <div style={{ fontFamily: FONT.head, fontSize: 90, color: i === 0 ? C.red : C.teal, width: 420 }}>{outlet}</div>
                <div style={{ fontFamily: FONT.head, fontSize: 120, color: C.white }}>{quote}</div>
              </Panel>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  // agenda · chips · pros · cons · check
  const icon = (i: number, shown: boolean) => {
    if (v === "pros") return <div style={{ width: 70, height: 70, borderRadius: 35, background: C.green, color: C.ink, fontFamily: FONT.head, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>+</div>;
    if (v === "cons") return <div style={{ width: 70, height: 70, borderRadius: 35, background: C.red, color: "#fff", fontFamily: FONT.head, fontSize: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>−</div>;
    if (v === "check")
      return (
        <div style={{ width: 64, height: 64, borderRadius: 12, border: `5px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", background: shown ? C.green : "transparent" }}>
          {shown && (
            <svg width="44" height="44" viewBox="0 0 24 24">
              <path d="M4 12.5l5 5L20 6.5" stroke="#0a0418" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      );
    if (v === "agenda") return <div style={{ fontFamily: FONT.head, fontSize: 80, ...gradText(), width: 110 }}>{String(i + 1).padStart(2, "0")}</div>;
    return <div style={{ width: 22, height: 22, borderRadius: 11, background: C.pink }} />;
  };
  const accent = v === "pros" ? C.green : v === "cons" ? C.red : v === "check" ? C.teal : C.pink;
  const big = v === "chips" ? 84 : items.length > 4 ? 56 : 64;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.6)" }}>
      <div style={{ width: 1400, translate: "0px -50px" }}>
        {p.title && (
          <div style={{ fontFamily: FONT.head, fontSize: 110, color: accent, textShadow: "6px 6px 0 #0a0418", marginBottom: 26, opacity: ein(frame, 0, 10), letterSpacing: 2 }}>{p.title}</div>
        )}
        {items.map((it, i) => {
          const at = rel(it, from, i);
          const shown = frame >= at;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 34,
                margin: "18px 0",
                padding: "16px 30px",
                background: shown ? "rgba(255,255,255,0.07)" : "transparent",
                borderLeft: `8px solid ${shown ? accent : "rgba(255,255,255,0.15)"}`,
                opacity: v === "check" ? (shown ? 1 : 0.35) : ein(frame, at, 8),
                translate: v === "check" ? "0px 0px" : `${interpolate(frame, [at, at + 12], [-120, 0], { ...clamp, easing: EASE })}px 0px`,
              }}
            >
              {icon(i, shown)}
              <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: big, color: C.white, textShadow: outline(3, "#0a0418") }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Cast: React.FC<BeatProps> = ({ p, from }) => {
  const frame = useCurrentFrame();
  const items: { name: string; desc: string; frame?: number }[] = p.items ?? [];
  const colors = [C.teal, C.pink, C.orange, C.yellow];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.6)" }}>
      <Label size={46} color={C.yellow} style={{ position: "absolute", top: 140, letterSpacing: 14 }}>
        EL REPARTO DE LEONIDA
      </Label>
      <div style={{ display: "flex", gap: 34, translate: "0px -10px" }}>
        {items.map((it, i) => {
          const at = (it.frame ?? from + i * 30) - from;
          const shown = frame >= at;
          return (
            <div
              key={i}
              style={{
                width: 390,
                height: 560,
                borderRadius: 18,
                border: `4px solid ${colors[i]}`,
                background: `linear-gradient(180deg, ${colors[i]}33, rgba(10,4,24,0.95) 60%)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 20,
                opacity: shown ? 1 : 0.18,
                translate: `0px ${interpolate(frame, [at, at + 12], [60, 0], { ...clamp, easing: EASE })}px`,
                boxShadow: shown ? `0 0 40px ${colors[i]}66` : "none",
              }}
            >
              <Silhouette hair={i === 1 ? "hood" : "short"} rim={colors[i]} size={260} />
              <div style={{ fontFamily: FONT.head, fontSize: 56, color: C.white, marginTop: 8, textAlign: "center", lineHeight: 1 }}>{it.name}</div>
              <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 28, color: colors[i], marginTop: 12, textAlign: "center", lineHeight: 1.2 }}>{it.desc}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Poll: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const a = 50 + 6 * Math.sin(frame / 20);
  const opts = [
    { l: p.a, v: a, c: C.teal },
    { l: p.b, v: 100 - a, c: C.pink },
  ];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.6)" }}>
      <Panel style={{ width: 1300, padding: "50px 60px", translate: "0px -40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: GRADIENT_AVATAR }} />
          <div>
            <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: 30, color: C.white }}>Comenta abajo</div>
            <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 24, color: "#b9a6d6" }}>Encuesta</div>
          </div>
        </div>
        <div style={{ fontFamily: FONT.head, fontSize: 96, color: C.white, marginBottom: 20 }}>{p.q}</div>
        {opts.map((o, i) => (
          <div key={i} style={{ position: "relative", height: 110, margin: "18px 0", borderRadius: 14, background: "rgba(255,255,255,0.08)", overflow: "hidden", opacity: ein(frame, 6 + i * 6, 8) }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${interpolate(frame, [6, 30], [0, o.v], clamp)}%`, background: `${o.c}aa` }} />
            <div style={{ position: "absolute", left: 30, top: 14, fontFamily: FONT.head, fontSize: 76, color: "#fff" }}>{o.l}</div>
            <div style={{ position: "absolute", right: 30, top: 14, fontFamily: FONT.head, fontSize: 76, color: "#fff" }}>{Math.round(o.v)}%</div>
          </div>
        ))}
      </Panel>
    </AbsoluteFill>
  );
};

const GRADIENT_AVATAR = `linear-gradient(135deg, ${C.yellow}, ${C.magenta})`;

export const Subscribe: React.FC<BeatProps> = () => {
  const frame = useCurrentFrame();
  const clickAt = 26;
  const done = frame >= clickAt;
  const cx = interpolate(frame, [0, clickAt - 4], [1500, 1130], { ...clamp, easing: EASE });
  const cy = interpolate(frame, [0, clickAt - 4], [900, 560], { ...clamp, easing: EASE });
  const press = interpolate(frame, [clickAt - 3, clickAt, clickAt + 4], [1, 0.9, 1], clamp);
  const bellAt = clickAt + 14;
  const ring = frame >= bellAt ? Math.sin((frame - bellAt) / 2) * 22 * Math.exp(-(frame - bellAt) / 14) : 0;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.55)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 40, translate: "0px -40px", scale: `${press}` }}>
        <div
          style={{
            padding: "40px 80px",
            borderRadius: 999,
            background: done ? "#3b3348" : "#ff1f3d",
            color: done ? "#c8bdd8" : "#fff",
            fontFamily: FONT.body,
            fontWeight: 900,
            fontSize: 88,
            letterSpacing: 2,
            boxShadow: done ? "none" : "0 0 60px #ff1f3daa",
          }}
        >
          {done ? "SUSCRITO" : "SUSCRÍBETE"}
        </div>
        <div style={{ rotate: `${ring}deg`, transformOrigin: "50% 10%", opacity: ein(frame, clickAt + 4, 8) }}>
          <svg width="150" height="150" viewBox="0 0 24 24">
            <path d="M12 2a6 6 0 00-6 6v4.5L4 16v1h16v-1l-2-3.5V8a6 6 0 00-6-6zm0 20a2.5 2.5 0 002.5-2.5h-5A2.5 2.5 0 0012 22z" fill={C.yellow} />
          </svg>
        </div>
      </div>
      <svg width="90" height="90" viewBox="0 0 24 24" style={{ position: "absolute", left: cx, top: cy }}>
        <path d="M4 2l14 10-6 1.5 3.5 7-2.5 1.2-3.5-7L4 19z" fill="#fff" stroke="#000" strokeWidth="1.2" />
      </svg>
      <Label size={46} color={C.yellow} style={{ position: "absolute", top: 760, opacity: ein(frame, bellAt, 10) }}>
        Y ACTIVA LA CAMPANITA
      </Label>
    </AbsoluteFill>
  );
};
