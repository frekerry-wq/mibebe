#!/usr/bin/env python3
"""Genera out/gta6_subtitulos_es.srt a partir de la alineación (subtítulos para YouTube)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
fps = tl["fps"]
def ts(f):
    ms = int(round(f / fps * 1000))
    h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
lines = []
for i, c in enumerate(tl["captions"], 1):
    text = " ".join(w["w"] for w in c["words"])
    lines.append(f"{i}\n{ts(c['from'])} --> {ts(c['to'])}\n{text}\n")
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
open(os.path.join(ROOT, "out", "gta6_subtitulos_es.srt"), "w").write("\n".join(lines))
print(len(lines), "subtítulos")
for ch in tl["chapters"]:
    s = ch["frame"] // fps
    print(f"{s//60}:{s%60:02d} {ch['title']}")
