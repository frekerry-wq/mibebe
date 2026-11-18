import React from "react";
import { AbsoluteFill } from "remotion";
import { ViceBackground } from "./components/Background";
import { C, FONT, gradText, neonGlow, outline } from "./theme";

/** Miniatura 1280x720 para YouTube */
export const Thumbnail: React.FC = () => {
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -320, top: -180, width: 1920, height: 1080, scale: "0.75", transformOrigin: "50% 50%" }}>
        <ViceBackground variant="sunset" />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(10,4,24,0.85) 0%, rgba(10,4,24,0.35) 55%, rgba(10,4,24,0) 100%)" }} />
      <div style={{ position: "absolute", left: 50, top: 40 }}>
        <div style={{ display: "inline-block", background: C.red, color: "#fff", fontFamily: FONT.head, fontSize: 54, padding: "4px 22px", rotate: "-3deg", letterSpacing: 2 }}>SALE MAÑANA</div>
        <div style={{ fontFamily: FONT.head, fontSize: 250, lineHeight: 0.95, marginTop: 10, ...gradText(), filter: "drop-shadow(9px 9px 0 #0a0418)" }}>GTA 6</div>
        <div style={{ fontFamily: FONT.script, fontSize: 104, color: "#fff", marginTop: -46, rotate: "-6deg", textShadow: neonGlow(C.magenta, 1.2) }}>la espera termina</div>
        <div style={{ fontFamily: FONT.head, fontSize: 78, color: C.white, marginTop: 14, textShadow: outline(5, "#0a0418"), lineHeight: 1 }}>
          13 AÑOS · 2 RETRASOS
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 160,
          width: 330,
          height: 330,
          borderRadius: 40,
          background: "linear-gradient(160deg, #7fe04a, #66cc33 50%, #3f9a17)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.body,
          fontWeight: 900,
          fontSize: 210,
          color: "#fff",
          rotate: "6deg",
          boxShadow: "0 0 90px #66cc33cc, 16px 16px 0 rgba(0,0,0,0.5)",
          border: "8px solid #fff",
        }}
      >
        99
      </div>
      <div style={{ position: "absolute", right: 50, top: 520, width: 420, textAlign: "center", fontFamily: FONT.head, fontSize: 58, lineHeight: 1.05, color: C.yellow, textShadow: outline(5, "#0a0418"), rotate: "6deg" }}>¿EL MEJOR DE LA HISTORIA?</div>
    </AbsoluteFill>
  );
};
