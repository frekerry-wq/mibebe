import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";

type Pal = { sky: string[]; sun: string[] | null; moon?: boolean; grid: string; floor: string[]; skyline: string; windows: string; stars: boolean };

export const PALETTES: Record<string, Pal> = {
  sunset: { sky: ["#12052b", "#3b0f5e", "#9b2470", "#ff5e62", "#ffb15c"], sun: ["#ffe66d", "#ff8a3d", "#ff2d95"], grid: "rgba(255,70,190,0.55)", floor: ["#2a0846", "#0a0418"], skyline: "#1a0733", windows: "#ffb15c", stars: true },
  night: { sky: ["#02030a", "#050b1f", "#0a1d3a", "#0e3550", "#16506a"], sun: null, moon: true, grid: "rgba(41,230,212,0.45)", floor: ["#04121f", "#010409"], skyline: "#020712", windows: "#29e6d4", stars: true },
  storm: { sky: ["#0a0206", "#22030f", "#4a0818", "#7e1028", "#b3243a"], sun: ["#ffb39a", "#ff3b4e", "#7a0b20"], grid: "rgba(255,59,78,0.5)", floor: ["#25040c", "#070103"], skyline: "#140207", windows: "#ff6b6b", stars: false },
  dusk: { sky: ["#07051a", "#1d0b45", "#4a1670", "#8e2a86", "#e0507c"], sun: ["#ffd1e8", "#ff5fa2", "#a5268f"], grid: "rgba(255,95,162,0.5)", floor: ["#1d0838", "#07030f"], skyline: "#12052a", windows: "#ff9ccc", stars: true },
  gold: { sky: ["#140800", "#3d1a00", "#7a3a00", "#d07a12", "#ffd27a"], sun: ["#fff3b0", "#ffd166", "#ff8a3d"], grid: "rgba(255,201,74,0.5)", floor: ["#2e1400", "#0a0400"], skyline: "#1d0c00", windows: "#ffe08a", stars: false },
  money: { sky: ["#010d08", "#02261a", "#05432c", "#0b6b43", "#2fae6e"], sun: ["#eaffb0", "#3ddc84", "#0b6b43"], grid: "rgba(61,220,132,0.5)", floor: ["#03251a", "#010705"], skyline: "#011a10", windows: "#b8ffcf", stars: false },
};

const HORIZON = 640;

const Palm: React.FC<{ x: number; scale: number; flip?: boolean; sway: number; color: string }> = ({ x, scale, flip, sway, color }) => {
  const leaves = useMemo(() => {
    const crown = { x: 230, y: 170 };
    const defs = [
      { a: -170, L: 230, d: 120 }, { a: -150, L: 250, d: 60 }, { a: -120, L: 200, d: 10 }, { a: -80, L: 190, d: 10 },
      { a: -40, L: 240, d: 50 }, { a: -15, L: 250, d: 120 }, { a: 20, L: 200, d: 150 }, { a: 160, L: 190, d: 150 },
    ];
    return defs.map(({ a, L, d }) => {
      const r = (a * Math.PI) / 180;
      const tip = { x: crown.x + Math.cos(r) * L, y: crown.y + Math.sin(r) * L * 0.6 + d };
      const mid = { x: crown.x + Math.cos(r) * L * 0.55, y: crown.y + Math.sin(r) * L * 0.55 - 45 };
      const nx = -Math.sin(r) * 22;
      const ny = Math.cos(r) * 22;
      return `M ${crown.x} ${crown.y} Q ${mid.x + nx} ${mid.y + ny} ${tip.x} ${tip.y} Q ${mid.x - nx} ${mid.y - ny} ${crown.x} ${crown.y} Z`;
    });
  }, []);
  return (
    <svg
      viewBox="0 0 460 820"
      style={{ position: "absolute", left: x, bottom: 0, width: 460 * scale, height: 820 * scale, transform: `${flip ? "scaleX(-1)" : ""}`, transformOrigin: "50% 100%" }}
    >
      <path d="M 200 820 C 210 600, 250 420, 228 172 L 240 172 C 262 420, 226 600, 236 820 Z" fill={color} />
      <g style={{ transform: `rotate(${sway}deg)`, transformOrigin: "230px 170px" }}>
        {leaves.map((d, i) => (
          <path key={i} d={d} fill={color} />
        ))}
        <circle cx={228} cy={182} r={14} fill={color} />
      </g>
    </svg>
  );
};

const Skyline: React.FC<{ color: string; windows: string; frame: number }> = ({ color, windows, frame }) => {
  const b = useMemo(() => {
    const arr: { x: number; w: number; h: number; spire: boolean; seed: number }[] = [];
    let x = 360;
    let i = 0;
    while (x < 1560) {
      const w = 34 + random(`w${i}`) * 70;
      const center = 1 - Math.abs(x + w / 2 - 980) / 650;
      const h = 40 + random(`h${i}`) * 140 * Math.max(0.25, center) + 60 * Math.max(0, center);
      arr.push({ x, w, h, spire: random(`s${i}`) > 0.75, seed: i });
      x += w + 4 + random(`g${i}`) * 10;
      i++;
    }
    return arr;
  }, []);
  return (
    <svg viewBox="0 0 1920 300" style={{ position: "absolute", left: 0, top: HORIZON - 300, width: 1920, height: 300 }}>
      {b.map((bd) => (
        <g key={bd.seed}>
          <rect x={bd.x} y={300 - bd.h} width={bd.w} height={bd.h} fill={color} />
          {bd.spire && <rect x={bd.x + bd.w / 2 - 2} y={300 - bd.h - 40} width={4} height={40} fill={color} />}
          {Array.from({ length: Math.floor(bd.h / 18) }).map((_, r) =>
            Array.from({ length: Math.floor(bd.w / 14) }).map((__, c) => {
              const on = random(`win${bd.seed}-${r}-${c}`) > 0.72;
              const flick = random(`f${bd.seed}-${r}-${c}-${Math.floor(frame / 45)}`) > 0.08;
              return on && flick ? (
                <rect key={`${r}-${c}`} x={bd.x + 5 + c * 14} y={300 - bd.h + 8 + r * 18} width={5} height={7} fill={windows} opacity={0.55} />
              ) : null;
            })
          )}
        </g>
      ))}
    </svg>
  );
};

export const ViceBackground: React.FC<{ variant?: string; dim?: number }> = ({ variant = "sunset", dim = 0 }) => {
  const frame = useCurrentFrame();
  const p = PALETTES[variant] ?? PALETTES.sunset;
  const sunY = interpolate(Math.sin(frame / 400), [-1, 1], [HORIZON - 210, HORIZON - 250]);
  const sway = Math.sin(frame / 38) * 2.2;
  const stars = useMemo(
    () => Array.from({ length: 70 }).map((_, i) => ({ x: random(`sx${i}`) * 1920, y: random(`sy${i}`) * 420, r: 0.8 + random(`sr${i}`) * 1.8, p: random(`sp${i}`) * 6 })),
    []
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: p.sky[0] }}>
      {/* cielo */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${p.sky[0]} 0%, ${p.sky[1]} 25%, ${p.sky[2]} 50%, ${p.sky[3]} 75%, ${p.sky[4]} ${(HORIZON / 1080) * 100}%)` }} />
      {p.stars &&
        stars.map((s, i) => (
          <div key={i} style={{ position: "absolute", left: s.x, top: s.y, width: s.r * 2, height: s.r * 2, borderRadius: "50%", background: "#fff", opacity: 0.25 + 0.5 * Math.abs(Math.sin(frame / 25 + s.p)) }} />
        ))}
      {/* resplandor del sol */}
      <div style={{ position: "absolute", left: 960 - 700, top: sunY - 450, width: 1400, height: 1100, background: `radial-gradient(closest-side, ${p.sun ? p.sun[1] : "#5ef2ff"}55, transparent 70%)` }} />
      {p.sun && (
        <div
          style={{
            position: "absolute",
            left: 960 - 260,
            top: sunY,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: `linear-gradient(180deg, ${p.sun[0]} 0%, ${p.sun[1]} 45%, ${p.sun[2]} 100%)`,
            WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 52%, transparent 52%), repeating-linear-gradient(180deg, #000 0px, #000 18px, transparent 18px, transparent 28px)",
          }}
        />
      )}
      {p.moon && <div style={{ position: "absolute", left: 1320, top: 120, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, #f2fbff, #9fc9d6 70%)", boxShadow: "0 0 60px #5ef2ff55" }} />}
      <Skyline color={p.skyline} windows={p.windows} frame={frame} />
      {/* suelo + rejilla */}
      <div style={{ position: "absolute", left: 0, top: HORIZON, width: 1920, height: 1080 - HORIZON, background: `linear-gradient(180deg, ${p.floor[0]}, ${p.floor[1]})` }} />
      <div style={{ position: "absolute", left: 0, top: HORIZON, width: 1920, height: 1080 - HORIZON, perspective: 420, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: -1920,
            top: 0,
            width: 5760,
            height: 1400,
            transform: "rotateX(72deg)",
            transformOrigin: "50% 0%",
            backgroundImage: `repeating-linear-gradient(90deg, ${p.grid} 0px, ${p.grid} 3px, transparent 3px, transparent 120px), repeating-linear-gradient(180deg, ${p.grid} 0px, ${p.grid} 3px, transparent 3px, transparent 120px)`,
            backgroundPosition: `0px ${(frame * 4) % 120}px`,
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${p.floor[0]} 0%, transparent 35%)` }} />
      </div>
      {/* línea de horizonte */}
      <div style={{ position: "absolute", left: 0, top: HORIZON - 2, width: 1920, height: 4, background: p.sun ? p.sun[1] : "#29e6d4", opacity: 0.8 }} />
      <Palm x={-70} scale={1.15} sway={sway} color="#07020f" />
      <Palm x={140} scale={0.8} sway={-sway * 0.8} color="#0b0418" flip />
      <Palm x={1440} scale={1.05} sway={-sway} color="#07020f" flip />
      <Palm x={1660} scale={0.78} sway={sway * 0.7} color="#0b0418" />
      {dim > 0 && <AbsoluteFill style={{ backgroundColor: `rgba(8,3,20,${dim})` }} />}
    </AbsoluteFill>
  );
};
