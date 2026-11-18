import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { C, FONT, GRADIENT, gradText, neonGlow, outline } from "../theme";
import { BeatProps, clamp, ein, EASE, Label, Panel, shake, Silhouette, Stamp } from "./common";

/* ───────────── Filtración ───────────── */
export const Terminal: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const count = Math.min(p.count, Math.floor(interpolate(frame, [30, 120], [0, p.count], clamp)));
  const lines = [
    "> conectando a servidor remoto...",
    "> acceso concedido",
    "> exportando build_dev/*.mp4",
    ...Array.from({ length: Math.min(count, 9) }).map((_, i) => `> subiendo clip_${String(Math.max(1, count - (Math.min(count, 9) - 1) + i)).padStart(3, "0")}.mp4 ...... OK`),
  ];
  const visible = lines.slice(0, Math.floor(frame / 8) + 1);
  const alert = count >= p.count;
  const g = random(`tg${Math.floor(frame / 4)}`) > 0.85;
  return (
    <AbsoluteFill style={{ background: "rgba(0,6,8,0.75)" }}>
      <Label size={44} color={C.teal} style={{ position: "absolute", left: 160, top: 120, letterSpacing: 12, opacity: ein(frame, 0, 10) }}>
        {p.date}
      </Label>
      <div style={{ position: "absolute", left: 160, top: 200, width: 1600, height: 640, border: `3px solid ${C.teal}`, background: "rgba(0,12,14,0.92)", boxShadow: `0 0 40px ${C.teal}44`, translate: g ? `${(random(`tx${frame}`) - 0.5) * 20}px 0px` : "0px 0px" }}>
        <div style={{ height: 50, background: `${C.teal}22`, borderBottom: `2px solid ${C.teal}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 12 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
          ))}
          <div style={{ fontFamily: FONT.mono, fontSize: 26, color: C.teal, marginLeft: 20 }}>root@leak: ~/gta6</div>
        </div>
        <div style={{ padding: "20px 34px", fontFamily: FONT.mono, fontSize: 38, color: "#9ffcef", lineHeight: 1.35 }}>
          {visible.slice(-11).map((l, i) => (
            <div key={i}>{l}</div>
          ))}
          <span style={{ opacity: Math.floor(frame / 8) % 2 }}>█</span>
        </div>
        <div style={{ position: "absolute", right: 40, bottom: 30, fontFamily: FONT.head, fontSize: 150, color: alert ? C.red : C.teal, lineHeight: 1 }}>
          {count}
          {alert ? "+" : ""}
          <span style={{ fontSize: 50, marginLeft: 14 }}>VIDEOS</span>
        </div>
      </div>
      {alert && <Stamp text="FILTRADO" at={122} size={170} rotate={-10} style={{ left: 640, top: 380 }} />}
    </AbsoluteFill>
  );
};

export const DevBuild: React.FC<BeatProps> = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#1c1f26" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.08) 2px, transparent 2px)", backgroundSize: "80px 80px", backgroundPosition: `${frame}px ${frame * 0.5}px` }} />
      {[
        { x: 300, y: 330, w: 380, h: 300 },
        { x: 760, y: 260, w: 260, h: 420 },
        { x: 1100, y: 380, w: 460, h: 250 },
      ].map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x, top: b.y + Math.sin(frame / 20 + i) * 6, width: b.w, height: b.h, border: "3px dashed #ff00ff", background: "rgba(255,0,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 30, color: "#ff7bff" }}>PLACEHOLDER_{String(i + 1).padStart(2, "0")}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 60, top: 130, fontFamily: FONT.mono, fontSize: 30, color: "#a6ff00", lineHeight: 1.4 }}>
        <div>FPS: {24 + Math.floor(random(`fps${Math.floor(frame / 10)}`) * 8)}</div>
        <div>POS: {(1203.44 + frame * 0.37).toFixed(2)}, -842.10, 14.02</div>
        <div>BUILD: DEV_INTERNAL</div>
        <div>MEM: {(5.4 + random(`m${Math.floor(frame / 15)}`) * 0.3).toFixed(2)} GB</div>
      </div>
      <div style={{ position: "absolute", right: 80, top: 140, width: 440, background: "rgba(0,0,0,0.75)", border: "2px solid #888", fontFamily: FONT.mono, fontSize: 30, color: "#ddd" }}>
        <div style={{ background: "#555", padding: "8px 16px" }}>MENÚ DE PRUEBA</div>
        {["spawn_vehicle", "set_weather", "teleport", "debug_cam", "toggle_hud"].map((m, i) => (
          <div key={m} style={{ padding: "6px 16px", background: Math.floor(frame / 12) % 5 === i ? "#2c6" : "transparent", color: Math.floor(frame / 12) % 5 === i ? "#000" : "#ddd" }}>
            {m}
          </div>
        ))}
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 220 }}>
        <div style={{ fontFamily: FONT.head, fontSize: 120, color: "#fff", textShadow: outline(5, "#000"), opacity: ein(frame, 6, 10) }}>VERSIÓN TEMPRANA</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Stock: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const pts = useMemo(() => {
    const arr: number[] = [];
    let v = 0.35;
    for (let i = 0; i < 60; i++) {
      v += (random(`st${i}`) - 0.5) * 0.06 + (i > 32 ? 0.022 : -0.002);
      arr.push(Math.max(0.05, Math.min(0.95, v)));
    }
    return arr;
  }, []);
  const prog = interpolate(frame, [4, 50], [0, 1], { ...clamp, easing: EASE });
  const n = Math.max(2, Math.floor(prog * pts.length));
  const W = 1400;
  const H = 520;
  const path = pts
    .slice(0, n)
    .map((y, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * W} ${y * H}`)
    .join(" ");
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,2,6,0.75)" }}>
      <div style={{ width: W, translate: "0px -40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <Label size={52}>{p.label}</Label>
          <div style={{ fontFamily: FONT.head, fontSize: 110, color: C.red, opacity: ein(frame, 40, 8) }}>▼ {p.ticker}</div>
        </div>
        <svg width={W} height={H} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
          {[0.25, 0.5, 0.75].map((y) => (
            <line key={y} x1={0} x2={W} y1={y * H} y2={y * H} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
          ))}
          <path d={path} stroke={n > 34 ? C.red : C.green} strokeWidth={8} fill="none" strokeLinejoin="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const Hacker: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const stage = p.stage as string;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(0,4,8,0.8)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 70, translate: "0px -40px" }}>
        <div style={{ position: "relative", opacity: ein(frame, 0, 12) }}>
          <Silhouette hair="hood" rim={stage === "who" ? C.teal : C.red} size={520} />
          {stage === "who" && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: FONT.head, fontSize: 220, color: C.teal, textShadow: neonGlow(C.teal, 0.8), opacity: 0.6 + 0.4 * Math.sin(frame / 5) }}>?</div>
          )}
        </div>
        {stage === "profile" && (
          <Panel border={C.red} style={{ padding: "40px 54px", width: 820, opacity: ein(frame, 4, 10), translate: `${(1 - ein(frame, 4, 14)) * 120}px 0px` }}>
            <Label size={34} color={C.red}>
              EXPEDIENTE
            </Label>
            <div style={{ fontFamily: FONT.head, fontSize: 200, color: C.white, lineHeight: 1 }}>17 AÑOS</div>
            <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 48, color: C.white, marginTop: 10 }}>Reino Unido</div>
            <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 48, color: C.teal, marginTop: 6 }}>Grupo hacker LAPSUS$</div>
          </Panel>
        )}
        {stage === "hotel" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <Label size={44} color={C.yellow} style={{ opacity: ein(frame, 0, 10) }}>
              DESDE UN HOTEL · BAJO FIANZA
            </Label>
            {[
              { t: "TELEVISOR DEL CUARTO", c: C.teal },
              { t: "UN TELÉFONO", c: C.pink },
              { t: "DISPOSITIVO DE STREAMING", c: C.orange },
            ].map((it, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, opacity: ein(frame, 10 + i * 14, 8), translate: `${(1 - ein(frame, 10 + i * 14, 12)) * 100}px 0px` }}>
                <div style={{ width: 90, height: 64, borderRadius: 10, border: `5px solid ${it.c}`, background: `${it.c}22` }} />
                <div style={{ fontFamily: FONT.head, fontSize: 74, color: C.white }}>{it.t}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── Redes / comentarios ───────────── */
const LEAK_COMMENTS = ["QUEREMOS EL TRÁILER", "¿Cuándo sale?", "10 años esperando...", "Rockstar di algo", "Esto es real??", "No puedo más", "GTA 6 YA", "Llevo años refrescando"];
const MEME_COMMENTS = ["NOOOOO", "¿¿2026??", "Mi abuelo no llega", "Otro año más...", "Rockstar por favor", "Me voy a dormir hasta 2026", "Ya ni me sorprende", "Vale la pena esperar"];

export const Comments: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const list = p.mode === "memes" ? MEME_COMMENTS : LEAK_COMMENTS;
  const colors = [C.pink, C.teal, C.yellow, C.orange];
  return (
    <AbsoluteFill style={{ background: "rgba(10,4,24,0.6)" }}>
      <Label size={84} style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", fontFamily: FONT.head, letterSpacing: 4 }}>
        {p.title}
      </Label>
      {list.map((t, i) => {
        const at = 6 + i * 7;
        const x = 110 + (i % 3) * 590 + random(`cx${i}`) * 50;
        const y = 280 + Math.floor(i / 3) * 190 + random(`cy${i}`) * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "18px 30px 18px 18px",
              maxWidth: 540,
              borderRadius: 40,
              background: "rgba(255,255,255,0.95)",
              boxShadow: "10px 10px 0 rgba(0,0,0,0.4)",
              opacity: ein(frame, at, 5),
              scale: `${interpolate(frame, [at, at + 8], [0.3, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })}`,
              rotate: `${(random(`cr${i}`) - 0.5) * 8}deg`,
            }}
          >
            <div style={{ width: 54, height: 54, flexShrink: 0, borderRadius: 27, background: colors[i % 4] }} />
            <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: 38, lineHeight: 1.15, color: C.ink }}>{t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Phone: React.FC<BeatProps> = () => {
  const frame = useCurrentFrame();
  const posts = [
    { u: "@vicecity_viral", t: "Un caimán en la piscina del hotel", c: C.teal },
    { u: "@keys_life", t: "EN VIVO desde el yate", c: C.pink },
    { u: "@leonida_news", t: "¿Qué está pasando en la autopista?", c: C.yellow },
    { u: "@flo_man_99", t: "Mírenme hacer esto por 1M likes", c: C.orange },
  ];
  const scroll = interpolate(frame, [10, 140], [0, -420], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const likes = Math.floor(interpolate(frame, [0, 150], [1200, 984000], clamp));
  return (
    <AbsoluteFill style={{ background: "rgba(10,4,24,0.55)" }}>
      <div style={{ position: "absolute", left: 260, top: 130, width: 450, height: 800, borderRadius: 60, background: "#08040f", border: "10px solid #2a2140", overflow: "hidden", boxShadow: `0 0 60px ${C.pink}55`, translate: `0px ${(1 - ein(frame, 0, 16)) * 300}px` }}>
        <div style={{ position: "absolute", top: 18, left: 160, width: 130, height: 30, borderRadius: 15, background: "#000", zIndex: 3 }} />
        <div style={{ translate: `0px ${scroll}px`, padding: "80px 22px" }}>
          {posts.map((po, i) => (
            <div key={i} style={{ marginBottom: 26, borderRadius: 20, overflow: "hidden", background: "#16101f" }}>
              <div style={{ height: 230, background: `linear-gradient(160deg, ${po.c}, #3b0f5e)`, position: "relative" }}>
                {i === 1 && <div style={{ position: "absolute", left: 14, top: 14, background: C.red, color: "#fff", fontFamily: FONT.body, fontWeight: 900, fontSize: 22, padding: "4px 12px", borderRadius: 6 }}>EN VIVO</div>}
              </div>
              <div style={{ padding: "12px 16px" }}>
                <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: 22, color: po.c }}>{po.u}</div>
                <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 24, color: "#fff" }}>{po.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 860, top: 260, width: 900 }}>
        <div style={{ fontFamily: FONT.head, fontSize: 130, lineHeight: 1.08, ...gradText(), opacity: ein(frame, 8, 12) }}>SÁTIRA DE LAS REDES</div>
        <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: 52, color: C.white, marginTop: 34, opacity: ein(frame, 16, 12), textShadow: outline(3, "#0a0418") }}>Virales · Directos · Influencers</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 40, opacity: ein(frame, 24, 12) }}>
          <svg width="90" height="90" viewBox="0 0 24 24">
            <path d="M12 21s-7.5-4.6-9.5-9.2C1 8 3.4 4.5 7 4.5c2 0 3.5 1 5 2.8 1.5-1.8 3-2.8 5-2.8 3.6 0 6 3.5 4.5 7.3C19.5 16.4 12 21 12 21z" fill={C.red} />
          </svg>
          <div style={{ fontFamily: FONT.head, fontSize: 110, color: C.white, fontVariantNumeric: "tabular-nums" }}>{likes.toLocaleString("es-ES").replace(/,/g, ".")}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── Tráileres / fechas ───────────── */
export const Player: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const inn = ein(frame, 0, 16);
  const prog = interpolate(frame, [0, 120], [0, 0.6], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.5)" }}>
      <div style={{ width: 1280, height: 720, borderRadius: 20, overflow: "hidden", position: "relative", border: "4px solid rgba(255,255,255,0.85)", boxShadow: `0 0 80px ${C.pink}66, 18px 18px 0 rgba(0,0,0,0.5)`, scale: `${interpolate(inn, [0, 1], [0.8, 1])}`, opacity: inn, translate: "0px -40px" }}>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, #2a0846 0%, #9b2470 45%, #ff7a3d 75%, #ffc46b 100%)` }} />
        <AbsoluteFill style={{ background: "repeating-linear-gradient(180deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 6px)" }} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontFamily: FONT.head, fontSize: 150, color: "#fff", textShadow: "8px 8px 0 rgba(10,4,24,0.8)", textAlign: "center", lineHeight: 1 }}>{p.title}</div>
          <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: 42, color: C.ink, background: C.yellow, padding: "6px 22px", marginTop: 20 }}>{p.sub}</div>
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 70, background: "linear-gradient(0deg, rgba(0,0,0,0.75), transparent)" }} />
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 8, background: "rgba(255,255,255,0.3)" }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", background: C.red }} />
          <div style={{ position: "absolute", left: `${prog * 100}%`, top: -8, width: 24, height: 24, borderRadius: 12, background: C.red, marginLeft: -12 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Calendar: React.FC<BeatProps> = ({ p, from }) => {
  const frame = useCurrentFrame();
  const inn = ein(frame, 0, 14);
  const stampAt = p.stampAtFrame !== undefined ? p.stampAtFrame - from : -1;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.55)" }}>
      <div style={{ position: "relative", translate: `0px ${(1 - inn) * 120 - 40}px`, opacity: inn, rotate: "-3deg" }}>
        <div style={{ width: 620, borderRadius: 24, overflow: "hidden", background: "#fff", boxShadow: "18px 18px 0 rgba(0,0,0,0.5)" }}>
          <div style={{ background: C.red, color: "#fff", fontFamily: FONT.head, fontSize: p.d ? 110 : 70, textAlign: "center", padding: "18px 0", letterSpacing: 8 }}>{p.m}</div>
          <div style={{ fontFamily: FONT.head, fontSize: p.d ? 340 : 280, color: C.ink, textAlign: "center", lineHeight: 1.05, padding: "10px 0" }}>{p.d || p.y}</div>
          {p.d && <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: 64, color: "#7a5a9a", textAlign: "center", paddingBottom: 26 }}>{p.y}</div>}
        </div>
        {stampAt >= 0 && <Stamp text={p.stamp} at={stampAt} size={130} rotate={-16} style={{ left: -90, top: 420 }} />}
      </div>
    </AbsoluteFill>
  );
};

export const DateCross: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [6, 18], [0, 100], clamp);
  const newIn = ein(frame, 16, 14);
  const sh = shake(frame, 16, 24, 12, "dc");
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.6)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", translate: `${sh.x}px ${sh.y - 40}px` }}>
        <Label size={44} color={p.gold ? C.gold : C.red} style={{ letterSpacing: 16 }}>
          {p.label}
        </Label>
        <div style={{ position: "relative", fontFamily: FONT.head, fontSize: 150, color: "rgba(255,255,255,0.55)", marginTop: 10 }}>
          {p.old}
          <div style={{ position: "absolute", left: 0, top: "52%", height: 16, width: `${strike}%`, background: C.red, rotate: "-4deg" }} />
        </div>
        <div style={{ fontFamily: FONT.head, fontSize: 240, lineHeight: 1, opacity: newIn, scale: `${interpolate(newIn, [0, 1], [1.4, 1])}`, ...gradText(p.gold ? `linear-gradient(180deg, #fff6c8, ${C.gold} 50%, #c46a00)` : GRADIENT), filter: "drop-shadow(8px 8px 0 #0a0418)" }}>
          {p.new}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Song: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const rot = frame * 6;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(10,4,24,0.55)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 70, translate: "0px -40px", opacity: ein(frame, 0, 12) }}>
        <div style={{ width: 700, height: 440, borderRadius: 26, background: "linear-gradient(160deg, #2b2238, #120c1c)", border: "6px solid #4a3d5e", position: "relative", boxShadow: "16px 16px 0 rgba(0,0,0,0.5)" }}>
          <div style={{ position: "absolute", left: 50, top: 40, right: 50, height: 120, borderRadius: 10, background: GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.script, fontSize: 64, color: "#fff", textShadow: "3px 3px 0 #0a0418" }}>
            Vice City Mix
          </div>
          <div style={{ position: "absolute", left: 140, right: 140, top: 200, height: 150, borderRadius: 75, background: "#0a0612", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 30px" }}>
            {[0, 1].map((k) => (
              <div key={k} style={{ width: 100, height: 100, borderRadius: 50, border: "10px solid #ddd", rotate: `${rot}deg`, background: "repeating-conic-gradient(#ddd 0 20deg, transparent 20deg 60deg)" }} />
            ))}
          </div>
        </div>
        <div>
          <Label size={40} color={C.yellow} style={{ letterSpacing: 12 }}>
            SONANDO
          </Label>
          <div style={{ fontFamily: FONT.head, fontSize: 130, color: C.white, lineHeight: 1 }}>{p.artist}</div>
          <div style={{ fontFamily: FONT.script, fontSize: 96, color: "#fff", textShadow: neonGlow(C.magenta, 1) }}>{p.title}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 24, height: 80, alignItems: "flex-end" }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{ width: 18, height: 12 + Math.abs(Math.sin(frame / 4 + i * 1.3)) * 66, background: i % 2 ? C.pink : C.teal }} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Money: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const bills = Array.from({ length: 34 });
  return (
    <AbsoluteFill style={{ background: "rgba(2,12,6,0.55)", overflow: "hidden" }}>
      {bills.map((_, i) => {
        const x = random(`bx${i}`) * 1920;
        const sp = 6 + random(`bs${i}`) * 8;
        const y = ((frame * sp + random(`by${i}`) * 1400) % 1400) - 200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(frame / 10 + i) * 40,
              top: y,
              width: 190,
              height: 90,
              background: "linear-gradient(135deg, #8fe3a8, #3fae6a)",
              border: "4px solid #1f6b3d",
              borderRadius: 6,
              rotate: `${frame * (random(`br${i}`) - 0.5) * 6 + i * 30}deg`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT.head,
              fontSize: 54,
              color: "#1f6b3d",
              opacity: 0.85,
            }}
          >
            $100
          </div>
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontFamily: FONT.head, fontSize: 240, lineHeight: 1, color: C.white, textShadow: `10px 10px 0 #0a0418, 0 0 60px ${C.green}`, scale: `${interpolate(frame, [0, 10], [1.5, 1], { ...clamp, easing: EASE })}`, translate: "0px -30px" }}>{p.title}</div>
        <Label size={56} color={C.green} style={{ marginTop: 6, opacity: ein(frame, 8, 10) }}>
          {p.sub}
        </Label>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── Mapa de Leonida ───────────── */
const LAND =
  "M40 140 L520 130 L560 150 L700 160 L770 165 L795 300 L835 450 L880 600 L905 720 L895 820 L855 885 L800 905 L760 865 L722 785 L690 700 L652 600 L620 520 L594 445 L560 382 L520 332 L470 292 L400 262 L300 252 L200 262 L100 252 L40 240 Z";
const PINS: Record<string, { x: number; y: number; name: string; desc: string; c: string }> = {
  vice: { x: 872, y: 770, name: "VICE CITY", desc: "Neón, playas, yates, clubes y dinero sucio", c: C.pink },
  keys: { x: 700, y: 945, name: "LEONIDA KEYS", desc: "Islas paradisíacas con negocios turbios", c: C.teal },
  grass: { x: 770, y: 815, name: "GRASSRIVERS", desc: "Pantanos y caimanes al estilo Everglades", c: C.green },
  port: { x: 250, y: 245, name: "PORT GELLHORN", desc: "Costa olvidada que vivió tiempos mejores", c: C.orange },
  ambrosia: { x: 720, y: 590, name: "AMBROSIA", desc: "Industria azucarera y territorio de moteros", c: C.yellow },
  kalaga: { x: 560, y: 185, name: "MOUNT KALAGA", desc: "Parque nacional: bosques, ríos y montañas", c: "#9be564" },
};

export const LeonidaMap: React.FC<BeatProps> = ({ p, from }) => {
  const frame = useCurrentFrame();
  const pins: { id: string; frame?: number }[] = p.pins ?? [];
  const times = pins.map((pn, i) => (pn.frame ?? from + 40 + i * 40) - from);
  let active = -1;
  times.forEach((t, i) => {
    if (frame >= t) active = i;
  });
  // cámara: interpolación entre objetivos
  const targets = [{ x: 480, y: 520, s: 0.8 }, ...pins.map((pn) => ({ x: PINS[pn.id].x, y: PINS[pn.id].y, s: 1.7 }))];
  const cur = active + 1;
  const tStart = active >= 0 ? times[active] : 0;
  const k = interpolate(frame, [tStart, tStart + 22], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const a = targets[Math.max(0, cur - 1)];
  const b = targets[cur];
  const cam = cur === 0 ? targets[0] : { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, s: a.s + (b.s - a.s) * k };
  const draw = interpolate(frame, [0, 30], [3000, 0], clamp);
  const VIEW = 800;
  const info = active >= 0 ? PINS[pins[active].id] : null;
  const infoIn = active >= 0 ? ein(frame, times[active] + 4, 12) : 0;
  return (
    <AbsoluteFill style={{ background: "rgba(5,2,14,0.75)" }}>
      <div style={{ position: "absolute", left: 130, top: 130, width: VIEW, height: VIEW, borderRadius: 40, overflow: "hidden", border: `5px solid ${C.teal}`, boxShadow: `0 0 50px ${C.teal}55`, background: "#06223a" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(94,242,255,0.06) 0 2px, transparent 2px 40px), repeating-linear-gradient(90deg, rgba(94,242,255,0.06) 0 2px, transparent 2px 40px)" }} />
        <svg
          viewBox="0 0 1000 1000"
          width={1000}
          height={1000}
          style={{ position: "absolute", left: VIEW / 2 - cam.x, top: VIEW / 2 - cam.y, scale: `${cam.s}`, transformOrigin: `${cam.x}px ${cam.y}px` }}
        >
          <path d={LAND} fill="#163a2c" stroke={C.teal} strokeWidth={4} strokeDasharray={3000} strokeDashoffset={draw} />
          <path d={LAND} fill="url(#landg)" opacity={ein(frame, 20, 20)} />
          <defs>
            <linearGradient id="landg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2e6b3f" />
              <stop offset="1" stopColor="#1d4a3a" />
            </linearGradient>
          </defs>
          <ellipse cx={792} cy={640} rx={42} ry={34} fill="#0b3d5c" stroke={C.teal} strokeWidth={2} opacity={ein(frame, 20, 20)} />
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse key={i} cx={790 - i * 22} cy={912 + i * 5} rx={12} ry={5} fill="#2e6b3f" stroke={C.teal} strokeWidth={1.5} opacity={ein(frame, 24, 20)} />
          ))}
          <path d="M470 160 L500 120 L530 160 M520 165 L555 110 L590 165" stroke="#cfe8d9" strokeWidth={4} fill="none" opacity={ein(frame, 24, 20) * 0.7} />
          {pins.map((pn, i) => {
            const P = PINS[pn.id];
            const t = frame - times[i];
            if (t < 0) return null;
            const drop = interpolate(t, [0, 8], [-60, 0], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
            const isAct = i === active;
            return (
              <g key={pn.id} transform={`translate(${P.x} ${P.y + drop}) scale(${1 / cam.s})`}>
                <circle r={isAct ? 26 + 8 * Math.sin(frame / 5) : 16} fill={P.c} opacity={0.25} />
                <circle r={11} fill={P.c} stroke="#0a0418" strokeWidth={4} />
                <text x={18} y={-16} fontFamily={FONT.head} fontSize={34} fill="#fff" stroke="#0a0418" strokeWidth={6} paintOrder="stroke">
                  {P.name}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ position: "absolute", left: 22, bottom: 16, fontFamily: FONT.mono, fontSize: 22, color: "rgba(255,255,255,0.6)" }}>MAPA ILUSTRATIVO</div>
      </div>
      <div style={{ position: "absolute", left: 1040, top: 150, width: 780 }}>
        <div style={{ fontFamily: FONT.script, fontSize: 90, color: "#fff", textShadow: neonGlow(C.magenta, 0.9) }}>Estado de</div>
        <div style={{ fontFamily: FONT.head, fontSize: 160, lineHeight: 0.9, ...gradText() }}>LEONIDA</div>
        <Label size={34} color={C.yellow} style={{ marginTop: 10, letterSpacing: 8 }}>
          LA FLORIDA DE ROCKSTAR
        </Label>
        {info && (
          <Panel border={info.c} style={{ marginTop: 50, padding: "30px 40px", opacity: infoIn, translate: `${(1 - infoIn) * 80}px 0px` }}>
            <div style={{ fontFamily: FONT.head, fontSize: 92, color: info.c, lineHeight: 1 }}>{info.name}</div>
            <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 40, color: C.white, marginTop: 12, lineHeight: 1.2 }}>{info.desc}</div>
          </Panel>
        )}
        <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
          {pins.map((pn, i) => (
            <div key={pn.id} style={{ width: 70, height: 10, borderRadius: 5, background: i <= active ? PINS[pn.id].c : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── Protagonistas ───────────── */
const ART: Record<string, string | null> = { lucia: null, jason: null };

const CharCard: React.FC<{ who: "lucia" | "jason"; focus: number; x: number }> = ({ who, focus, x }) => {
  const isL = who === "lucia";
  const c = isL ? C.pink : C.teal;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 110,
        width: 600,
        height: 780,
        borderRadius: 26,
        overflow: "hidden",
        border: `5px solid ${c}`,
        background: `linear-gradient(180deg, ${c}55 0%, rgba(10,4,24,0.96) 70%)`,
        boxShadow: `0 0 ${50 * focus}px ${c}88, 16px 16px 0 rgba(0,0,0,0.5)`,
        opacity: 0.35 + 0.65 * focus,
        scale: `${0.9 + 0.1 * focus}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ marginTop: 50 }}>{ART[who] ? <img src={ART[who]!} style={{ width: 520, height: 520, objectFit: "cover" }} /> : <Silhouette hair={isL ? "long" : "short"} rim={c} size={520} />}</div>
      <div style={{ fontFamily: FONT.head, fontSize: 104, color: C.white, lineHeight: 1, marginTop: 6, textShadow: "6px 6px 0 #0a0418" }}>{isL ? "LUCIA" : "JASON"}</div>
      <div style={{ fontFamily: FONT.head, fontSize: 64, color: c, lineHeight: 1 }}>{isL ? "CAMINOS" : "DUVAL"}</div>
    </div>
  );
};

export const Duo: React.FC<BeatProps> = ({ p, from }) => {
  const frame = useCurrentFrame();
  const stage = p.stage as string;
  const inn = ein(frame, 0, 16);
  const bullets: { text: string; frame?: number }[] = p.bullets ?? [];
  if (stage === "intro" || stage === "together") {
    const gap = stage === "together" ? interpolate(frame, [0, 30], [80, -40], { ...clamp, easing: EASE }) : 80;
    return (
      <AbsoluteFill style={{ background: "rgba(10,4,24,0.5)" }}>
        <div style={{ translate: `${(1 - inn) * -400 - gap / 2}px ${stage === "together" ? 40 : 0}px`, opacity: inn }}>
          <CharCard who="lucia" focus={1} x={360} />
        </div>
        <div style={{ translate: `${(1 - inn) * 400 + gap / 2}px ${stage === "together" ? 40 : 0}px`, opacity: inn }}>
          <CharCard who="jason" focus={1} x={960} />
        </div>
        {stage === "together" && (
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <svg width="220" height="220" viewBox="0 0 24 24" style={{ scale: `${1 + 0.08 * Math.sin(frame / 4)}`, opacity: ein(frame, 14, 10), filter: `drop-shadow(0 0 20px ${C.red})`, translate: "0px -60px" }}>
              <path d="M12 21s-7.5-4.6-9.5-9.2C1 8 3.4 4.5 7 4.5c2 0 3.5 1 5 2.8 1.5-1.8 3-2.8 5-2.8 3.6 0 6 3.5 4.5 7.3C19.5 16.4 12 21 12 21z" fill={C.red} stroke="#0a0418" strokeWidth={1} />
            </svg>
            <div style={{ position: "absolute", top: 18, padding: "0px 50px 10px", background: "rgba(10,4,24,0.88)", border: `4px solid ${C.pink}`, borderRadius: 20, opacity: ein(frame, 20, 10) }}>
              <div style={{ fontFamily: FONT.head, fontSize: 110, ...gradText() }}>{p.caption}</div>
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    );
  }
  const isL = stage === "lucia";
  const c = isL ? C.pink : C.teal;
  return (
    <AbsoluteFill style={{ background: "rgba(10,4,24,0.55)" }}>
      <div style={{ opacity: inn }}>
        <CharCard who={isL ? "lucia" : "jason"} focus={1} x={isL ? 140 : 1180} />
      </div>
      <div style={{ position: "absolute", left: isL ? 820 : 150, top: 170, width: 940 }}>
        {p.badge && (
          <div style={{ display: "inline-block", background: c, color: C.ink, fontFamily: FONT.body, fontWeight: 900, fontSize: 36, padding: "12px 24px", marginBottom: 30, opacity: ein(frame, 4, 10), letterSpacing: 1 }}>
            {p.badge}
          </div>
        )}
        <div style={{ fontFamily: FONT.head, fontSize: 150, color: C.white, lineHeight: 0.95, textShadow: "8px 8px 0 #0a0418", opacity: ein(frame, 0, 10) }}>{isL ? "LUCIA CAMINOS" : "JASON DUVAL"}</div>
        <div style={{ marginTop: 30 }}>
          {bullets.map((b, i) => {
            const at = (b.frame ?? from + 20 + i * 30) - from;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, margin: "22px 0", opacity: ein(frame, at, 8), translate: `${(1 - ein(frame, at, 12)) * 80}px 0px` }}>
                <div style={{ width: 20, height: 20, rotate: "45deg", background: c }} />
                <div style={{ fontFamily: FONT.body, fontWeight: 900, fontSize: 56, color: C.white, textShadow: outline(3, "#0a0418") }}>{b.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Mugshot: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#d9d4dc" }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 80 + i * 72, height: 3, background: "#2a2430", opacity: 0.5 }}>
          <div style={{ position: "absolute", left: 30, top: -40, fontFamily: FONT.mono, fontSize: 30, color: "#2a2430" }}>{`${6 - Math.floor(i / 2)}'${i % 2 ? "6" : "0"}"`}</div>
        </div>
      ))}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ translate: "0px -60px" }}>
          <Silhouette hair="long" color="#1c1622" rim="#4a4054" size={600} />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 610, top: 640, width: 700, background: "#0e0b12", border: "6px solid #fff", padding: "20px 30px", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 34, color: "#fff", letterSpacing: 4 }}>{p.place}</div>
        <div style={{ fontFamily: FONT.head, fontSize: 90, color: "#fff", lineHeight: 1.1 }}>{p.name}</div>
      </div>
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(frame, [0, 2, 8], [0, 1, 0], clamp) }} />
    </AbsoluteFill>
  );
};

export const Wanted: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const red = Math.floor(frame / 8) % 2 === 0;
  const stars = Math.min(5, Math.floor(frame / 9) + 1);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "rgba(5,2,12,0.7)" }}>
      <AbsoluteFill style={{ background: red ? "radial-gradient(circle at 0% 50%, rgba(255,40,60,0.55), transparent 60%)" : "radial-gradient(circle at 100% 50%, rgba(40,90,255,0.55), transparent 60%)" }} />
      <div style={{ display: "flex", gap: 24, translate: "0px -80px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="170" height="170" viewBox="0 0 24 24" style={{ scale: i < stars ? `${interpolate(frame - i * 9, [0, 6], [1.6, 1], clamp)}` : "1" }}>
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill={i < stars ? "#fff" : "rgba(255,255,255,0.1)"} stroke="#fff" strokeWidth={1.2} />
          </svg>
        ))}
      </div>
      <div style={{ position: "absolute", top: 640, fontFamily: FONT.head, fontSize: 120, color: C.white, textShadow: outline(5, "#0a0418") }}>{p.text}</div>
    </AbsoluteFill>
  );
};

export const Conspiracy: React.FC<BeatProps> = ({ p }) => {
  const frame = useCurrentFrame();
  const nodes = [
    { x: 330, y: 300, t: "VICE CITY" },
    { x: 960, y: 230, t: "LOS KEYS" },
    { x: 1580, y: 320, t: "PORT GELLHORN" },
    { x: 560, y: 650, t: "AMBROSIA" },
    { x: 1360, y: 650, t: "???" },
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [0, 3],
    [3, 4],
    [1, 4],
    [2, 4],
    [0, 4],
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #2a1608, #120902)" }}>
      <AbsoluteFill style={{ backgroundImage: `url(data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#3a220e"/><circle cx="2" cy="2" r="1" fill="#4a2c12"/></svg>')})`, opacity: 0.6 }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {edges.map(([a, b], i) => {
          const pr = interpolate(frame, [8 + i * 6, 24 + i * 6], [0, 1], clamp);
          const A = nodes[a];
          const B = nodes[b];
          return <line key={i} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * pr} y2={A.y + (B.y - A.y) * pr} stroke={C.red} strokeWidth={6} />;
        })}
      </svg>
      {nodes.map((n, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: n.x - 170,
            top: n.y - 70,
            width: 340,
            padding: "26px 10px",
            background: i === 4 ? "#ffe680" : "#f4efe6",
            rotate: `${(random(`cn${i}`) - 0.5) * 10}deg`,
            fontFamily: FONT.head,
            fontSize: 58,
            color: C.ink,
            textAlign: "center",
            boxShadow: "10px 10px 0 rgba(0,0,0,0.45)",
            opacity: ein(frame, i * 4, 6),
          }}
        >
          <div style={{ position: "absolute", left: 160, top: -12, width: 24, height: 24, borderRadius: 12, background: C.red }} />
          {n.t}
        </div>
      ))}
      <div style={{ position: "absolute", top: 820, width: "100%", textAlign: "center", fontFamily: FONT.head, fontSize: 72, color: C.white, textShadow: outline(4, "#000"), opacity: ein(frame, 30, 10) }}>{p.title}</div>
    </AbsoluteFill>
  );
};
