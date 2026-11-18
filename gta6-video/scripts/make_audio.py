#!/usr/bin/env python3
"""Sintetiza música synthwave + efectos de sonido y mezcla el master con la voz.

Salida:
  public/sfx/*.wav          biblioteca de efectos
  public/audio/music.wav    música sola (sin ducking)
  public/audio/master.wav   mezcla final (voz + música con ducking + efectos)
"""
import json, os, subprocess
import numpy as np
from scipy import signal
import pedalboard as pb

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
FPS = 30
rng = np.random.default_rng(7)
os.makedirs(os.path.join(ROOT, "public", "sfx"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)


# ───────────────────────── utilidades ─────────────────────────
def T(sec):
    return np.arange(int(sec * SR)) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=-1)


def hp(x, fc, order=2):
    sos = signal.butter(order, fc, "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=-1)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, min(hi, SR * 0.45)], "band", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=-1)


def sweep_bp(x, f0, f1, q=1.2, block=256, curve=None):
    """Filtro pasa-banda cuyo centro se mueve de f0 a f1 (curva opcional 0..1)."""
    n = len(x)
    out = np.zeros(n)
    zi = None
    nb = (n + block - 1) // block
    for b in range(nb):
        p = b / max(1, nb - 1)
        if curve is not None:
            p = curve(p)
        fc = f0 * (f1 / f0) ** p
        lo, hi = fc / (1 + 1 / q), fc * (1 + 1 / q)
        sos = signal.butter(2, [max(20, lo), min(hi, SR * 0.45)], "band", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        seg = x[b * block:(b + 1) * block]
        y, zi = signal.sosfilt(sos, seg, zi=zi)
        out[b * block:b * block + len(seg)] = y
    return out


def blep(t, dt):
    r = np.zeros_like(t)
    m1 = t < dt
    x = t[m1] / dt[m1] if np.ndim(dt) else t[m1] / dt
    r[m1] = x + x - x * x - 1
    m2 = t > 1 - (dt if np.ndim(dt) == 0 else dt)
    x = (t[m2] - 1) / (dt[m2] if np.ndim(dt) else dt)
    r[m2] = x * x + x + x + 1
    return r


def saw(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,)).copy()
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    return 2 * ph - 1 - blep(ph, dt)


def square(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,)).copy()
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    s = np.where(ph < 0.5, 1.0, -1.0)
    s += blep(ph, dt)
    ph2 = (ph + 0.5) % 1.0
    s -= blep(ph2, dt)
    return s


def sine(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    return np.sin(2 * np.pi * (phase0 + np.cumsum(f) / SR))


def adsr(n, a=0.01, d=0.1, s=0.7, r=0.2, hold=None):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    hold_n = n - r_n if hold is None else int(hold * SR)
    env = np.zeros(n)
    i = np.arange(n)
    env = np.where(i < a_n, i / max(1, a_n), env)
    m = (i >= a_n) & (i < a_n + d_n)
    env = np.where(m, 1 - (1 - s) * (i - a_n) / max(1, d_n), env)
    env = np.where((i >= a_n + d_n) & (i < hold_n), s, env)
    rel = i >= hold_n
    start_level = s if hold_n >= a_n + d_n else max(0.0, min(1.0, hold_n / max(1, a_n)))
    env = np.where(rel, start_level * np.clip(1 - (i - hold_n) / max(1, r_n), 0, 1), env)
    return env


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) + 1e-9
    return x * (peak / m)


def stereo(x, pan=0.0):
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    return np.vstack([x * l * 1.414, x * r * 1.414])


def fx(x, plugins):
    board = pb.Pedalboard(plugins)
    if x.ndim == 1:
        x = np.vstack([x, x])
    return board(x.astype(np.float32), SR).astype(np.float64)


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    if x.ndim == 1:
        x = np.vstack([x, x])
    with pb.io.AudioFile(path, "w", SR, 2, bit_depth=16) as f:
        f.write(x.astype(np.float32))


def pad_to(x, n):
    if x.shape[-1] >= n:
        return x[..., :n]
    padw = [(0, 0)] * (x.ndim - 1) + [(0, n - x.shape[-1])]
    return np.pad(x, padw)


# ───────────────────────── efectos de sonido ─────────────────────────
def sfx_whoosh():
    n = int(1.0 * SR)
    t = np.arange(n) / n
    env = np.sin(np.pi * np.clip(t / 0.95, 0, 1)) ** 2.2 * np.exp(-((t - 0.55) ** 2) / 0.08)
    x = sweep_bp(rng.standard_normal(n), 350, 4200, q=1.4, curve=lambda p: np.sin(np.pi * p * 0.9)) * env
    x = norm(x)
    st = np.vstack([x * np.clip(1.2 - t * 1.2, 0.2, 1), x * np.clip(t * 1.4, 0.2, 1)])
    return fx(st, [pb.Reverb(room_size=0.5, wet_level=0.18, dry_level=0.9)])


def sfx_riser():
    d = 2.2
    n = int(d * SR)
    t = np.arange(n) / n
    env = t ** 2.4
    nz = sweep_bp(rng.standard_normal(n), 250, 7000, q=1.6, curve=lambda p: p ** 1.6) * 0.8
    f = 180 * (6.0 ** (t ** 1.8))
    tone = (saw(f, n) * 0.25 + saw(f * 1.007, n) * 0.25 + sine(f * 0.5, n) * 0.3)
    tone = lp(tone, 5000)
    x = (nz + tone * 0.6) * env
    x[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    return fx(norm(x), [pb.Chorus(rate_hz=0.6, depth=0.4, mix=0.4), pb.Reverb(room_size=0.8, wet_level=0.3, dry_level=0.8)])


def sfx_impact():
    d = 1.6
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 42 + 110 * np.exp(-t * 18)
    body = sine(f, n) * np.exp(-t * 3.2)
    crack = lp(rng.standard_normal(n), 3500) * np.exp(-t * 28)
    mid = bp(rng.standard_normal(n), 120, 900) * np.exp(-t * 9) * 0.6
    x = np.tanh((body * 1.2 + crack * 0.7 + mid) * 1.6)
    return fx(norm(x), [pb.Reverb(room_size=0.85, wet_level=0.25, dry_level=0.9, damping=0.6)])


def sfx_boom():
    d = 3.2
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 30 + 70 * np.exp(-t * 6)
    sub = sine(f, n) * np.exp(-t * 1.3)
    rumble = lp(rng.standard_normal(n), 300) * np.exp(-t * 2.0) * 0.9
    hit = lp(rng.standard_normal(n), 2500) * np.exp(-t * 20) * 0.6
    x = np.tanh((sub * 1.4 + rumble + hit) * 1.4)
    return fx(norm(x), [pb.Reverb(room_size=0.95, wet_level=0.35, dry_level=0.85, damping=0.4)])


def sfx_drop():
    d = 3.4
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 30 + 95 * np.exp(-t * 2.4)
    sub = np.tanh(sine(f, n) * 2.2) * np.exp(-t * 0.9)
    x = sub * 0.9
    imp = pad_to(sfx_impact()[0], n)
    x = norm(x) * 0.85 + imp * 0.7
    return fx(norm(x), [pb.Reverb(room_size=0.9, wet_level=0.2, dry_level=0.9)])


def sfx_glitch():
    d = 0.7
    n = int(d * SR)
    x = np.zeros(n)
    pos = 0
    while pos < n:
        seg = int(rng.uniform(0.015, 0.06) * SR)
        kind = rng.integers(0, 3)
        tt = np.arange(seg) / SR
        if kind == 0:
            s = square(rng.uniform(200, 2400), seg)
        elif kind == 1:
            hold = rng.integers(8, 40)
            s = np.repeat(rng.standard_normal(seg // hold + 1), hold)[:seg]
        else:
            s = saw(np.linspace(rng.uniform(80, 400), rng.uniform(800, 3000), seg), seg)
        if rng.random() < 0.25:
            s *= 0
        x[pos:pos + seg] = s[: n - pos] * rng.uniform(0.4, 1.0)
        pos += seg
    x = np.round(x * 6) / 6
    x = hp(x, 120) * np.linspace(1, 0.6, n)
    return fx(norm(x, 0.8), [pb.Reverb(room_size=0.3, wet_level=0.1)])


def sfx_cash():
    d = 1.4
    n = int(d * SR)
    t = np.arange(n) / SR
    click = hp(rng.standard_normal(n), 2000) * np.exp(-t * 90) * 0.8
    bell_t0 = int(0.07 * SR)
    bt = np.clip(t - 0.07, 0, None)
    bell = np.zeros(n)
    for f, a, dec in [(2093, 1, 3.5), (2637, 0.7, 4), (3136, 0.6, 4.5), (4186, 0.4, 6), (5274, 0.25, 7), (1568, 0.5, 3)]:
        bell += a * np.sin(2 * np.pi * f * bt) * np.exp(-bt * dec)
    bell[:bell_t0] = 0
    coins = np.zeros(n)
    for _ in range(9):
        st = int(rng.uniform(0.1, 0.6) * SR)
        ln = int(0.08 * SR)
        f = rng.uniform(5000, 8000)
        seg = np.sin(2 * np.pi * f * np.arange(ln) / SR) * np.exp(-np.arange(ln) / SR * 60)
        coins[st:st + ln] += seg * rng.uniform(0.15, 0.35)
    drawer = lp(rng.standard_normal(n), 900) * np.exp(-t * 14) * 0.5
    x = click + bell * 0.5 + coins + drawer
    return fx(norm(x, 0.8), [pb.Reverb(room_size=0.4, wet_level=0.15)])


def sfx_tick():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 1800, 6000) * np.exp(-t * 160) + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120) * 0.5
    return stereo(norm(x, 0.7))


def sfx_ticks():
    d = 4.0
    n = int(d * SR)
    x = np.zeros(n)
    tk = sfx_tick()[0]
    for k in range(8):
        st = int(k * 0.5 * SR)
        g = 1.0 if k % 2 == 0 else 0.6
        x[st:st + len(tk)] += tk[: n - st] * g
    return stereo(x)


def sfx_notify():
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for st, f in [(0.0, 1318.5), (0.11, 1760.0)]:
        tt = np.clip(t - st, 0, None)
        e = np.where(t >= st, np.exp(-tt * 9) * (1 - np.exp(-tt * 400)), 0)
        x += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2 * tt)) * e
    return fx(norm(x, 0.6), [pb.Reverb(room_size=0.35, wet_level=0.2)])


def sfx_pop(f0=380, f1=950):
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    f = f0 + (f1 - f0) * (1 - np.exp(-t * 60))
    x = sine(f, n) * np.exp(-t * 38) * (1 - np.exp(-t * 2000))
    return stereo(norm(x, 0.7), rng.uniform(-0.5, 0.5))


def sfx_pops():
    d = 2.2
    n = int(d * SR)
    out = np.zeros((2, n))
    for k in range(9):
        st = int((0.05 + k * 0.2 + rng.uniform(-0.05, 0.05)) * SR)
        p = sfx_pop(rng.uniform(300, 500), rng.uniform(800, 1300))
        ln = min(p.shape[1], n - st)
        out[:, st:st + ln] += p[:, :ln] * rng.uniform(0.5, 1.0)
    return out


def sfx_stamp():
    n = int(0.7 * SR)
    t = np.arange(n) / SR
    thud = sine(110 + 60 * np.exp(-t * 40), n) * np.exp(-t * 14)
    slap = bp(rng.standard_normal(n), 600, 5000) * np.exp(-t * 45)
    x = np.tanh((thud * 1.3 + slap * 0.9) * 1.5)
    return fx(norm(x, 0.85), [pb.Reverb(room_size=0.45, wet_level=0.18)])


def sfx_check():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for st, f in [(0.0, 987.8), (0.07, 1480.0)]:
        tt = np.clip(t - st, 0, None)
        e = np.where(t >= st, np.exp(-tt * 14) * (1 - np.exp(-tt * 600)), 0)
        x += square(np.full(n, f), n) * 0.25 * e + np.sin(2 * np.pi * f * tt) * e
    x = lp(x, 6000)
    return fx(norm(x, 0.6), [pb.Reverb(room_size=0.3, wet_level=0.15)])


def sfx_heartbeat():
    d = 1.8
    n = int(d * SR)
    x = np.zeros(n)
    for st, g in [(0.0, 1.0), (0.26, 0.75)]:
        s0 = int(st * SR)
        ln = int(0.35 * SR)
        tt = np.arange(ln) / SR
        beat = sine(48 + 40 * np.exp(-tt * 30), ln) * np.exp(-tt * 13) * g
        x[s0:s0 + ln] += beat
    x = lp(np.tanh(x * 2.2), 400)
    return fx(norm(x, 0.95), [pb.Reverb(room_size=0.6, wet_level=0.15)])


def sfx_news():
    d = 2.4
    n = int(d * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    # arpegio ascendente + acorde final
    for st, notes, ln in [(0.0, [62], 0.12), (0.13, [65], 0.12), (0.26, [69], 0.12), (0.4, [57, 62, 65, 69, 74], 1.6)]:
        s0 = int(st * SR)
        m = int(ln * SR)
        seg = np.zeros(m)
        for k in notes:
            f = mtof(k)
            seg += saw(np.full(m, f), m) + saw(np.full(m, f * 1.005), m) * 0.7
        env = adsr(m, 0.005, 0.15, 0.55, min(0.6, ln * 0.6))
        out[s0:s0 + m] += lp(seg, 2600) * env / len(notes) ** 0.5
    timp = sine(70 + 30 * np.exp(-t * 10), n) * np.exp(-np.clip(t - 0.4, 0, None) * 4) * (t >= 0.4)
    out += timp * 0.9
    return fx(norm(out, 0.8), [pb.Reverb(room_size=0.75, wet_level=0.25)])


def sfx_down():
    d = 1.4
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 620 * np.exp(-t * 1.7) + 90
    x = lp(saw(f, n) + saw(f * 1.01, n), 1800) * np.exp(-t * 1.6) * 0.6
    thud = sine(60 + 50 * np.exp(-t * 20), n) * np.exp(-t * 6)
    x = x + thud * 0.8
    return fx(norm(x, 0.8), [pb.Reverb(room_size=0.6, wet_level=0.2)])


def sfx_siren():
    d = 3.6
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 950 + 380 * np.sin(2 * np.pi * 0.55 * t - np.pi / 2)
    x = (square(f, n) * 0.35 + sine(f, n) * 0.6)
    x = bp(x, 400, 3200)
    env = np.clip(t / 0.4, 0, 1) * np.clip((d - t) / 0.6, 0, 1)
    dist = 0.55 + 0.45 * np.sin(np.pi * t / d)
    x = x * env * dist
    st = np.vstack([x * (0.6 + 0.4 * t / d), x * (1 - 0.4 * t / d)])
    return fx(st, [pb.Reverb(room_size=0.9, wet_level=0.35, dry_level=0.7)])


def sfx_shutter():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for st, g in [(0.0, 1.0), (0.09, 0.8)]:
        tt = np.clip(t - st, 0, None)
        x += hp(rng.standard_normal(n), 1500) * np.exp(-tt * 120) * (t >= st) * g
    x += bp(rng.standard_normal(n), 300, 1500) * np.exp(-t * 25) * 0.4
    return stereo(norm(x, 0.8))


def sfx_tape():
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for st in [0.0, 0.18, 0.5]:
        tt = np.clip(t - st, 0, None)
        x += bp(rng.standard_normal(n), 800, 5000) * np.exp(-tt * 140) * (t >= st)
    hum = lp(saw(np.linspace(60, 120, n), n), 500) * np.clip((t - 0.5) / 0.3, 0, 1) * np.exp(-np.clip(t - 0.8, 0, None) * 6) * 0.3
    hiss = hp(rng.standard_normal(n), 4000) * 0.06 * (t > 0.5)
    return stereo(norm(x + hum + hiss, 0.7))


def sfx_neon():
    d = 1.6
    n = int(d * SR)
    t = np.arange(n) / SR
    buzz = (saw(np.full(n, 120.0), n) * 0.5 + square(np.full(n, 240.0), n) * 0.2)
    buzz = bp(buzz, 100, 3000)
    gate = np.ones(n)
    for a, b in [(0.0, 0.05), (0.12, 0.2), (0.28, 0.31), (0.4, 0.46)]:
        gate[int(a * SR):int(b * SR)] = 0
    gate[: int(0.0 * SR)] = 0
    gate = np.convolve(gate, np.ones(80) / 80, mode="same")
    sparks = np.zeros(n)
    for st in [0.05, 0.2, 0.31, 0.46]:
        s0 = int(st * SR)
        ln = int(0.03 * SR)
        sparks[s0:s0 + ln] += hp(rng.standard_normal(ln), 3000) * np.exp(-np.arange(ln) / SR * 150)
    env = np.clip((d - t) / 0.5, 0, 1)
    x = buzz * gate * env * 0.6 + sparks * 0.8
    return fx(norm(x, 0.6), [pb.Reverb(room_size=0.4, wet_level=0.15)])


def sfx_pin():
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    x = sine(1700 * np.exp(-t * 4) + 600, n) * np.exp(-t * 18) * 0.6
    x += sine(90 + 50 * np.exp(-t * 30), n) * np.exp(-t * 20)
    return fx(norm(x, 0.7), [pb.Reverb(room_size=0.4, wet_level=0.2)])


def sfx_click():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 2500) * np.exp(-t * 300) * 0.9
    bt = np.clip(t - 0.45, 0, None)
    bell = np.zeros(n)
    for f, a, dec in [(1760, 1.0, 3), (3520, 0.4, 5), (2637, 0.35, 4), (5280, 0.15, 7)]:
        bell += a * np.sin(2 * np.pi * f * bt) * np.exp(-bt * dec)
    bell *= (t >= 0.45)
    x += bell * 0.45
    return fx(norm(x, 0.7), [pb.Reverb(room_size=0.5, wet_level=0.2)])


SFX = {
    "whoosh": sfx_whoosh, "riser": sfx_riser, "impact": sfx_impact, "boom": sfx_boom, "drop": sfx_drop,
    "glitch": sfx_glitch, "cash": sfx_cash, "tick": sfx_ticks, "notify": sfx_notify, "pop": sfx_pop,
    "pops": sfx_pops, "stamp": sfx_stamp, "check": sfx_check, "heartbeat": sfx_heartbeat, "news": sfx_news,
    "down": sfx_down, "siren": sfx_siren, "shutter": sfx_shutter, "tape": sfx_tape, "neon": sfx_neon,
    "pin": sfx_pin, "click": sfx_click,
}
SFX_GAIN = {"riser": 0.55, "boom": 0.9, "drop": 1.0, "impact": 0.8, "whoosh": 0.5, "glitch": 0.45, "cash": 0.5,
            "tick": 0.45, "notify": 0.45, "pop": 0.4, "pops": 0.4, "stamp": 0.7, "check": 0.45, "heartbeat": 0.9,
            "news": 0.5, "down": 0.55, "siren": 0.35, "shutter": 0.5, "tape": 0.5, "neon": 0.45, "pin": 0.5, "click": 0.5}

# ───────────────────────── música ─────────────────────────
BPM = 100
BEAT = 60 / BPM
BAR = BEAT * 4

# acordes como listas MIDI (raíz para el bajo + notas del acorde)
CH = {
    "Am": (45, [57, 60, 64]), "F": (41, [57, 60, 65]), "C": (48, [55, 60, 64]), "G": (43, [55, 59, 62]),
    "E": (40, [56, 59, 64]), "Em": (40, [55, 59, 64]), "Dm": (50, [57, 62, 65]), "Bb": (46, [58, 62, 65]),
    "A": (45, [57, 61, 64]),
}
PROG = {
    "main": ["Am", "F", "C", "G"],
    "dark": ["Am", "Am", "F", "E"],
    "tension": ["Dm", "Am", "Bb", "A"],
    "sad": ["Am", "Em", "F", "C"],
    "bright": ["C", "G", "Am", "F"],
    "triumph": ["F", "G", "C", "Am"],
}
LEAD = [  # (beat, dur, midi) por compás de la progresión principal
    [(0, 1.5, 76), (1.5, 0.5, 74), (2, 1, 72), (3, 1, 74)],
    [(0, 1.5, 72), (1.5, 0.5, 69), (2, 2, 72)],
    [(0, 1.5, 79), (1.5, 0.5, 76), (2, 1, 74), (3, 1, 72)],
    [(0, 3, 74), (3, 1, 71)],
]


def drum_kick():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    x = sine(45 + 120 * np.exp(-t * 32), n) * np.exp(-t * 7.5)
    x += hp(rng.standard_normal(n), 3000) * np.exp(-t * 300) * 0.3
    return np.tanh(x * 1.8) * 0.9


def drum_snare():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    nz = bp(rng.standard_normal(n), 900, 7000) * np.exp(-t * 16)
    tone = sine(185 + 40 * np.exp(-t * 40), n) * np.exp(-t * 22)
    return (nz * 0.8 + tone * 0.6)


def drum_hat(open_=False):
    n = int((0.35 if open_ else 0.08) * SR)
    t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 7500) * np.exp(-t * (10 if open_ else 70))
    return x * (0.5 if open_ else 0.4)


def drum_crash():
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 4000) * np.exp(-t * 2.2) * 0.5


KICK, SNARE, HATC, HATO, CRASH = drum_kick(), drum_snare(), drum_hat(), drum_hat(True), drum_crash()


def place(buf, x, at):
    s = int(at * SR)
    if s >= buf.shape[-1]:
        return
    ln = min(x.shape[-1], buf.shape[-1] - s)
    buf[..., s:s + ln] += x[..., :ln]


def render_section(prog, dur, energy_fn, lead=False, fade_out=0.0, bright=1.0):
    n = int(dur * SR)
    pad = np.zeros(n)
    bass = np.zeros(n)
    arp = np.zeros(n)
    kick = np.zeros(n)
    snare = np.zeros(n)
    hats = np.zeros(n)
    leadb = np.zeros(n)
    crash = np.zeros(n)
    nbars = int(np.ceil(dur / BAR)) + 1
    chords = PROG[prog]
    kick_times = []
    for b in range(nbars):
        t0 = b * BAR
        if t0 >= dur:
            break
        e = energy_fn(t0)
        root, notes = CH[chords[b % 4]]
        # PAD: saws desafinados, ataque lento
        m = int((BAR + 0.8) * SR)
        seg = np.zeros(m)
        for k in notes + [notes[0] + 12]:
            f = mtof(k)
            for det in (-0.006, 0.0, 0.0065):
                seg += saw(np.full(m, f * (1 + det)), m, rng.random())
        seg = lp(seg, 1400 + 500 * bright) * adsr(m, 0.35, 0.3, 0.8, 0.8, hold=BAR) / 10
        place(pad, seg, t0)
        # ARP: semicorcheas
        arp_notes = notes + [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 12]
        step = BEAT / 4 if e >= 1 else BEAT / 2
        steps = int(BAR / step)
        for s_ in range(steps):
            k = arp_notes[s_ % len(arp_notes)] + 12
            ln = int(step * 0.9 * SR)
            f = mtof(k)
            tone = square(np.full(ln, f), ln) * 0.5 + saw(np.full(ln, f * 1.003), ln) * 0.5
            tt = np.arange(ln) / SR
            env = np.exp(-tt * 14) * (1 - np.exp(-tt * 800))
            br = lp(tone, 4200 if e >= 1 else 1100) * env
            place(arp, br * (0.55 if e >= 1 else 0.4), t0 + s_ * step)
        # BAJO
        if e >= 1:
            bstep = BEAT / 2 if e >= 2 else BEAT
            for s_ in range(int(BAR / bstep)):
                k = root + (12 if (s_ % 2 == 1 and e >= 3) else 0)
                ln = int(bstep * 0.92 * SR)
                f = mtof(k)
                tone = saw(np.full(ln, f), ln) * 0.6 + square(np.full(ln, f * 0.5), ln) * 0.4
                tt = np.arange(ln) / SR
                bright_env = np.exp(-tt * 10)
                dark = lp(tone, 220)
                brt = lp(tone, 1400)
                env = (1 - np.exp(-tt * 500)) * np.clip((ln / SR - tt) / 0.02, 0, 1)
                place(bass, (dark * (1 - bright_env) + brt * bright_env) * env, t0 + s_ * bstep)
        # BATERÍA
        if e >= 2:
            kicks = [0, 1, 2, 3] if e >= 3 else [0, 2]
            for q in kicks:
                place(kick, KICK, t0 + q * BEAT)
                kick_times.append(t0 + q * BEAT)
            hstep = BEAT / 4 if e >= 3 else BEAT / 2
            for s_ in range(int(BAR / hstep)):
                g = 1.0 if s_ % 2 == 0 else 0.6
                place(hats, HATC * g, t0 + s_ * hstep)
            if e >= 3:
                for q in [0.5, 1.5, 2.5, 3.5]:
                    place(hats, HATO * 0.6, t0 + q * BEAT)
        if e >= 3:
            for q in [1, 3]:
                place(snare, SNARE, t0 + q * BEAT)
        if (e >= 3 and b == 0) or (e >= 3 and b % 8 == 0):
            place(crash, CRASH, t0)
        # LEAD
        if lead and e >= 4:
            for (bt_, d_, k) in LEAD[b % 4]:
                ln = int(d_ * BEAT * SR)
                f = mtof(k)
                tt = np.arange(ln) / SR
                vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * tt) * np.clip(tt / 0.3, 0, 1)
                tone = saw(f * vib, ln) * 0.5 + saw(f * vib * 1.006, ln) * 0.5 + square(f * vib * 0.5, ln) * 0.2
                tone = lp(tone, 3800) * adsr(ln, 0.02, 0.2, 0.75, 0.15)
                place(leadb, tone, t0 + bt_ * BEAT)

    # procesamiento por pista
    pad_s = fx(pad, [pb.Chorus(rate_hz=0.4, depth=0.5, mix=0.5), pb.Reverb(room_size=0.9, wet_level=0.45, dry_level=0.6, width=1.0)]) * 0.55
    arp_s = fx(arp, [pb.Delay(delay_seconds=BEAT * 0.75, feedback=0.38, mix=0.3), pb.Reverb(room_size=0.7, wet_level=0.3, dry_level=0.8)]) * 0.32
    bass_s = stereo(np.tanh(bass * 1.5)) * 0.42
    kick_s = stereo(kick) * 0.75
    sn_dry = snare
    sn_rev = fx(snare, [pb.Reverb(room_size=0.95, wet_level=1.0, dry_level=0.0, damping=0.3)])
    # reverb "gated" ochentera
    gate = np.zeros(n)
    for b in range(nbars):
        for q in [1, 3]:
            s0 = int((b * BAR + q * BEAT) * SR)
            g_len = int(0.26 * SR)
            if s0 < n:
                gate[s0:s0 + g_len] = 1
    gate = np.convolve(gate, np.ones(220) / 220, mode="same")
    snare_s = (stereo(sn_dry) * 0.55 + sn_rev[:, :n] * gate * 1.6) * 0.5
    hats_s = np.vstack([hats * 0.9, np.roll(hats, int(0.004 * SR))]) * 0.3
    crash_s = fx(crash, [pb.Reverb(room_size=0.6, wet_level=0.2)]) * 0.35
    lead_s = fx(leadb, [pb.Delay(delay_seconds=BEAT * 0.75, feedback=0.3, mix=0.28), pb.Reverb(room_size=0.85, wet_level=0.35, dry_level=0.75)]) * 0.33

    # sidechain del kick sobre pad y bajo (bombeo synthwave)
    sc = np.ones(n)
    kt = [int(x * SR) for x in kick_times if x < dur]
    env_len = int(0.3 * SR)
    duck = 1 - 0.45 * np.exp(-np.arange(env_len) / SR * 9)
    for k in kt:
        ln = min(env_len, n - k)
        sc[k:k + ln] = np.minimum(sc[k:k + ln], duck[:ln])
    mix = (pad_s[:, :n] + bass_s[:, :n]) * sc + arp_s[:, :n] + kick_s + snare_s + hats_s + crash_s[:, :n] + lead_s[:, :n]
    if fade_out > 0:
        fo = int(fade_out * SR)
        mix[:, -fo:] *= np.linspace(1, 0, fo) ** 2
    return mix


def energy(points):
    def f(t):
        lv = points[0][1]
        for (tt, v) in points:
            if t >= tt:
                lv = v
        return lv
    return f


# ───────────────────────── mezcla ─────────────────────────
def load_mp3(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"])
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).T.astype(np.float64)


def main():
    tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
    total = tl["total"] / FPS
    N = int(total * SR) + SR

    # 1) biblioteca de sfx
    lib = {}
    for name, fn in SFX.items():
        x = fn()
        if x.ndim == 1:
            x = stereo(x)
        lib[name] = x
        write_wav(os.path.join(ROOT, "public", "sfx", name + ".wav"), x)
    print("sfx ok", len(lib))

    # 2) música por segmento
    music_spec = {
        "s00_hook": ("dark", energy([(0, 1), (14, 2)]), False),
        "s01_silencio": ("main", energy([(0, 2), (22, 3)]), False),
        "s02_filtracion": ("tension", energy([(0, 1), (10, 2)]), False),
        "s03_trailer": ("main", energy([(0, 3)]), False),
        "s04_retrasos": ("sad", energy([(0, 1), (24, 2)]), False),
        "s05_leonida": ("bright", energy([(0, 3)]), False),
        "s06_protas": ("dark", energy([(0, 2), (38, 3)]), False),
        "s07_veredicto": ("triumph", energy([(0, 3)]), False),
        "s08_numeros": ("triumph", energy([(0, 3)]), False),
        "s09_cierre": ("main", energy([(0, 2), (28, 3)]), False),
    }
    music = np.zeros((2, N))
    blocks = []
    segs = tl["segments"]
    for i, s in enumerate(segs):
        st = s["from"] / FPS
        en = s["end"] / FPS
        blocks.append((s["id"], st, en))
        if i == 0:
            blocks.append(("title", tl["title"]["from"] / FPS, (tl["title"]["from"] + tl["title"]["dur"]) / FPS))
    blocks.append(("endcard", tl["endcard"]["from"] / FPS, total))
    for name, st, en in blocks:
        dur = en - st + 0.25
        if name == "title":
            sec = render_section("main", dur, energy([(0, 4)]), lead=True)
        elif name == "endcard":
            sec = render_section("main", dur, energy([(0, 4)]), lead=True, fade_out=4.0)
        else:
            prog, ef, ld = music_spec[name]
            sec = render_section(prog, dur, ef, lead=ld, bright=0.6 if name in ("s02_filtracion", "s04_retrasos") else 1.0)
        # micro fundidos para empalmar
        fi = int(0.03 * SR)
        sec[:, :fi] *= np.linspace(0, 1, fi)
        fo = int(0.25 * SR)
        sec[:, -fo:] *= np.linspace(1, 0, fo)
        if name == "s00_hook":
            # silencio dramático antes del drop del título
            cut = int((en - 0.9 - st) * SR)
            sec[:, cut:] *= np.linspace(1, 0, sec.shape[1] - cut) ** 3
        place(music, sec, st)
        print("music", name, round(dur, 1), "s")
    music = fx(music, [pb.HighpassFilter(30), pb.Compressor(threshold_db=-16, ratio=2.5, attack_ms=20, release_ms=200)])
    write_wav(os.path.join(ROOT, "public", "audio", "music.wav"), norm(music, 0.9))

    # 3) voz
    vo = np.zeros((2, N))
    duck = np.full(N, 1.0)
    for s in segs:
        x = load_mp3(os.path.join(ROOT, "public", "vo", s["id"] + ".mp3"))
        place(vo, x, s["voFrom"] / FPS)
        a = int(s["voFrom"] / FPS * SR) - int(0.15 * SR)
        b = int((s["voFrom"] + s["voFrames"]) / FPS * SR) + int(0.2 * SR)
        duck[max(0, a):b] = 0.0
    vo = fx(vo, [pb.HighpassFilter(75), pb.Compressor(threshold_db=-22, ratio=3, attack_ms=8, release_ms=120),
                 pb.LowShelfFilter(cutoff_frequency_hz=180, gain_db=1.5), pb.PeakFilter(cutoff_frequency_hz=3200, gain_db=2.0, q=0.9)])
    # suavizar ducking (ataque/release ~0.35 s)
    k = int(0.35 * SR)
    duck = np.convolve(duck, np.ones(k) / k, mode="same")
    music_gain = 0.16 + 0.62 * duck   # bajo la voz ≈ -16 dB, en pausas casi a tope

    # 4) sfx
    sfxbus = np.zeros((2, N))
    for c in tl["sfx"]:
        x = lib[c["name"]] * SFX_GAIN.get(c["name"], 0.5) * c.get("gain", 0.85)
        place(sfxbus, x, c["frame"] / FPS)
    sfxbus = fx(sfxbus, [pb.Compressor(threshold_db=-10, ratio=3, attack_ms=2, release_ms=100)])

    m = norm(music, 0.9)
    vo_n = vo / (np.max(np.abs(vo)) + 1e-9) * 0.9
    master = vo_n * 1.0 + m * music_gain * 0.55 + sfxbus * 0.6
    master = fx(master, [pb.Compressor(threshold_db=-14, ratio=2, attack_ms=10, release_ms=150), pb.Limiter(threshold_db=-1.5, release_ms=80)])
    master = master[:, : int(total * SR)]
    tmp = os.path.join(ROOT, "public", "audio", "master_pre.wav")
    write_wav(tmp, master)
    # normalización de sonoridad para YouTube (-14 LUFS)
    out = os.path.join(ROOT, "public", "audio", "master.wav")
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", af, "-ar", str(SR), out])
    print("loudness in:", j["input_i"], "LUFS")
    os.remove(tmp)
    print("master ok", round(total, 1), "s")


if __name__ == "__main__":
    main()
