#!/usr/bin/env python3
"""Construye src/timeline.json a partir de guion.json + beats.json + alineación de la voz.

Resuelve cada ancla de texto ("at") al frame exacto en que el narrador dice esa frase.
"""
import json, math, os, re, subprocess, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
CARD = 78          # duración de la tarjeta de capítulo (frames)
TITLE = 180        # título principal tras el gancho
ENDCARD = 390      # pantalla final (13 s, para elementos de YouTube)
LEAD = 4           # adelanto visual respecto a la palabra

segs = json.load(open(os.path.join(ROOT, "scripts", "guion.json")))
beats_cfg = json.load(open(os.path.join(ROOT, "scripts", "beats.json")))


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9ñ$]", "", w)


def dur_s(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
    return float(out)


def find(words, phrase, start=0):
    toks = [norm(t) for t in phrase.split() if norm(t)]
    nw = [norm(w["w"]) for w in words]
    for i in range(start, len(nw) - len(toks) + 1):
        if nw[i:i + len(toks)] == toks:
            return i
    raise SystemExit(f"Ancla no encontrada: {phrase!r} (desde {start})")


timeline = {"fps": FPS, "segments": [], "captions": [], "sfx": [], "chapters": []}
t = 0
sfx = []

for idx, seg in enumerate(segs):
    sid = seg["id"]
    words = json.load(open(os.path.join(ROOT, "public", "vo", sid + ".json")))["words"]
    vodur = dur_s(os.path.join(ROOT, "public", "vo", sid + ".mp3"))
    is_hook = idx == 0
    if is_hook:
        card_from, card_dur = None, 0
        vo_from = 18
    else:
        card_from, card_dur = t, CARD
        vo_from = t + CARD + 4
        # riser hacia la tarjeta + golpe + whoosh de salida
        sfx += [
            {"name": "riser", "frame": max(0, t - 40), "gain": 0.7},
            {"name": "boom", "frame": t + 2, "gain": 0.9},
            {"name": "whoosh", "frame": t + CARD - 8, "gain": 0.6},
        ]
    vo_frames = math.ceil(vodur * FPS)
    end = vo_from + vo_frames + 12
    wf = [{"w": w["w"], "from": vo_from + round(w["s"] * FPS), "to": vo_from + round(w["e"] * FPS)} for w in words]

    cfg = beats_cfg[sid]
    out_beats = []
    pos = 0
    for b in cfg["beats"]:
        if b["at"] is None:
            bf = (vo_from - 6) if not is_hook else 0
            bi = 0
        else:
            bi = find(words, b["at"], pos)
            pos = bi
            bf = wf[bi]["from"] - LEAD
        props = json.loads(json.dumps(b.get("props", {})))
        # resolver sub-anclas dentro de props (items[].at, pins[].at, bullets[].at, stampAt, pcAt)
        for key in ("items", "pins", "bullets"):
            if key in props:
                p2 = bi
                for it in props[key]:
                    if it.get("at"):
                        j = find(words, it["at"], p2)
                        p2 = j
                        it["frame"] = wf[j]["from"] - LEAD
                        sfx.append({"name": {"stamps": "stamp", "rumors": "stamp", "check": "check", "cons": "pop", "pros": "pop", "quotes": "impact"}.get(props.get("variant"), "pop") if key == "items" else ("pin" if key == "pins" else "pop"), "frame": it["frame"] + 2, "gain": 0.8})
        for key in ("stampAt", "pcAt"):
            if key in props:
                j = find(words, props[key], bi)
                props[key + "Frame"] = wf[j]["from"] - LEAD
                sfx.append({"name": "stamp", "frame": props[key + "Frame"] + 2, "gain": 0.9})
        out_beats.append({"type": b["type"], "from": bf, "props": props})
        if b.get("sfx"):
            off = b.get("sfxOffset", 0 if b["sfx"] in ("riser",) else 2)
            sfx.append({"name": b["sfx"], "frame": max(0, bf + off), "gain": 0.85})
    for i, b in enumerate(out_beats):
        nxt = out_beats[i + 1]["from"] if i + 1 < len(out_beats) else end
        b["dur"] = max(1, nxt - b["from"])

    timeline["segments"].append({
        "id": sid, "chapter": seg["chapter"], "title": seg["title"], "bg": cfg.get("bg", "sunset"),
        "from": card_from if card_from is not None else 0,
        "cardFrom": card_from, "cardDur": card_dur,
        "voFrom": vo_from, "voFrames": vo_frames, "end": end,
        "beats": out_beats,
    })
    timeline["chapters"].append({"title": (seg["chapter"] + (" — " + seg["title"] if seg["title"] else "")), "frame": card_from if card_from is not None else 0})

    # subtítulos: líneas de hasta ~34 caracteres, cortando en puntuación
    line, chars = [], 0
    for w in wf:
        line.append(w)
        chars += len(w["w"]) + 1
        if chars > 30 or re.search(r"[.!?:;…]$", w["w"]) or (chars > 18 and w["w"].endswith(",")):
            timeline["captions"].append({"from": line[0]["from"], "to": line[-1]["to"], "words": line})
            line, chars = [], 0
    if line:
        timeline["captions"].append({"from": line[0]["from"], "to": line[-1]["to"], "words": line})

    t = end
    if is_hook:
        timeline["title"] = {"from": t, "dur": TITLE}
        sfx += [
            {"name": "riser", "frame": t - 50, "gain": 0.9},
            {"name": "drop", "frame": t + 4, "gain": 1.0},
        ]
        t += TITLE

timeline["endcard"] = {"from": t, "dur": ENDCARD}
sfx.append({"name": "boom", "frame": t + 2, "gain": 0.7})
t += ENDCARD
timeline["total"] = t
# extender cada subtítulo hasta el siguiente (máx 0.6 s) para evitar parpadeos
caps = timeline["captions"]
for i, c in enumerate(caps):
    nxt = caps[i + 1]["from"] if i + 1 < len(caps) else c["to"] + 18
    c["to"] = min(nxt, c["to"] + 18)
timeline["sfx"] = sorted(sfx, key=lambda s: s["frame"])

json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("total frames", t, "=", round(t / FPS, 1), "s", "=", f"{int(t/FPS)//60}:{int(t/FPS)%60:02d}")
for c in timeline["chapters"]:
    s = c["frame"] // FPS
    print(f"{s//60}:{s%60:02d}", c["title"])
print("beats", sum(len(s["beats"]) for s in timeline["segments"]), "sfx", len(sfx), "captions", len(caps))
