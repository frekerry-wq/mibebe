# GTA 6 — "La espera termina" (video para YouTube)

Video de ~9 minutos en español sobre el lanzamiento de GTA 6 (19 nov 2026), hecho con Remotion.
Estética Vice City / synthwave, narración con ElevenLabs, música y efectos sintetizados.

## Estructura
- `scripts/guion.json` — guion por segmentos (lo que dice el narrador).
- `scripts/beats.json` — "partitura visual": cada animación anclada a una frase del guion.
- `scripts/tts.py` — genera la voz (ElevenLabs, con marcas de tiempo por palabra) → `public/vo/`.
- `scripts/build_timeline.py` — resuelve las anclas a fotogramas → `src/timeline.json`.
- `scripts/make_audio.py` — sintetiza música synthwave + efectos y mezcla el master (−14 LUFS) → `public/audio/master.wav`.
- `scripts/make_srt.py` — subtítulos `.srt` para YouTube.
- `src/` — composición Remotion (`GTA6`) y miniatura (`Miniatura`).

## Regenerar
```bash
npm i
pip install numpy scipy pedalboard
python3 scripts/build_timeline.py
python3 scripts/make_audio.py
npx remotion render GTA6 out/gta6_silent.mp4 --muted --props='{"captions":true,"audio":false}'
ffmpeg -i out/gta6_silent.mp4 -i public/audio/master.wav -c:v copy -c:a aac -b:a 320k -shortest out/GTA6_la_espera_termina.mp4
npx remotion still Miniatura out/gta6_miniatura.png
```
Para quitar los subtítulos incrustados usa `--props='{"captions":false,"audio":false}'`.

Si cambias el texto de `guion.json`, vuelve a generar la voz de ese segmento con `python3 scripts/tts.py <id>` (consume créditos de ElevenLabs).
