#!/usr/bin/env python3
"""Genera la narración con ElevenLabs (con timestamps por carácter).

Uso: python3 scripts/tts.py [segment_id ...]
Guarda public/vo/<id>.mp3 y public/vo/<id>.json (alineación por palabra).
"""
import base64, json, os, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.environ.get("VOICE_ID", "IKne3meq5aSn9XLyUdCD")  # Charlie - Deep, Confident, Energetic
MODEL = os.environ.get("MODEL_ID", "eleven_v4_turbo")
OUT = os.path.join(ROOT, "public", "vo")
os.makedirs(OUT, exist_ok=True)

segs = json.load(open(os.path.join(ROOT, "scripts", "guion.json")))
only = set(sys.argv[1:])


def words_from_alignment(al):
    chars = al["characters"]
    st = al["character_start_times_seconds"]
    en = al["character_end_times_seconds"]
    words, cur, cs, ce = [], "", None, None
    for c, s, e in zip(chars, st, en):
        if c.isspace():
            if cur:
                words.append({"w": cur, "s": cs, "e": ce})
            cur, cs, ce = "", None, None
        else:
            if not cur:
                cs = s
            cur += c
            ce = e
    if cur:
        words.append({"w": cur, "s": cs, "e": ce})
    return words


for i, seg in enumerate(segs):
    if only and seg["id"] not in only:
        continue
    prev_text = segs[i - 1]["text"] if i > 0 else None
    next_text = segs[i + 1]["text"] if i + 1 < len(segs) else None
    body = {
        "text": seg["text"],
        "model_id": MODEL,
        "language_code": "es",
        "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "speed": 1.0},
    }
    if prev_text:
        body["previous_text"] = prev_text[-300:]
    if next_text:
        body["next_text"] = next_text[:300]
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(),
        headers={"xi-api-key": "dummy", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        print("ERROR", seg["id"], e.code, e.read()[:800])
        sys.exit(1)
    mp3 = base64.b64decode(data["audio_base64"])
    open(os.path.join(OUT, seg["id"] + ".mp3"), "wb").write(mp3)
    al = data.get("normalized_alignment") or data.get("alignment")
    words = words_from_alignment(data["alignment"])
    json.dump({"id": seg["id"], "words": words}, open(os.path.join(OUT, seg["id"] + ".json"), "w"), ensure_ascii=False)
    print("OK", seg["id"], len(mp3), "bytes", "dur~", words[-1]["e"] if words else None)
