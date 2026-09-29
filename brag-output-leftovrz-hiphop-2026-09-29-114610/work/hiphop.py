"""LEFTOVRZ — upbeat hip hop bed. 96 BPM, Eb major, swung 16ths, 9 bars (22.5s) + tail.

  bar 0   intro: crackle, filtered Rhodes, needle drop + scratch into bar 1
  1-3     groove: boom-bap kit, bass, Rhodes I-vi-ii-V, whistle hook   (title, the wall)
  4       + horn stabs                                                  (trading cards)
  5       break: drums thin out, claps + Rhodes                         (the flyer)
  6-7     full with horns                                               (vote, shoebox)
  8       outro: last stab, tail                                        (the stamp)
"""
import numpy as np
from scipy.signal import butter, lfilter
import subprocess, sys

SR = 44100
BPM = 96.0
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
SWING = 0.30            # odd 16ths pushed a third of a 16th late
BARS = 9
N = int(SR * (BARS * BAR + 2.0))
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(11)


def T(bar, step=0.0):
    whole = int(step)
    frac = step - whole
    sw = SWING * S16 if whole % 2 == 1 else 0.0
    return bar * BAR + whole * S16 + sw + frac * S16


def filt(kind, x, f, order=2):
    if kind == "band":
        b, a = butter(order, [f[0] / (SR / 2), f[1] / (SR / 2)], btype="band")
    else:
        b, a = butter(order, min(f, SR / 2 - 200) / (SR / 2), btype=kind)
    return lfilter(b, a, x)


def add(sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * g * np.cos((pan + 1) * np.pi / 4) * 1.414
    R[i:i + len(sig)] += sig * g * np.sin((pan + 1) * np.pi / 4) * 1.414


def tt(d):
    return np.arange(int(d * SR)) / SR


def nf(midi):
    return 440 * 2 ** ((midi - 69) / 12)


# ---- drums ----
def kick():
    t = tt(0.38)
    f = 50 + 95 * np.exp(-t * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
    s += 0.4 * filt("high", rng.standard_normal(len(t)), 3000) * np.exp(-t * 200)
    return np.tanh(2.0 * s) * 0.95


def snare():
    t = tt(0.32)
    nz = filt("band", rng.standard_normal(len(t)), (1200, 7500)) * np.exp(-t * 17)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 22)
    clapz = np.zeros(len(t))
    for o in (0.0, 0.009, 0.019):
        i = int(o * SR); clapz[i:] += np.exp(-t[: len(t) - i] * 70)
    clap = filt("band", rng.standard_normal(len(t)), (900, 4000)) * clapz
    return np.tanh(1.5 * (nz * 0.8 + body * 0.6 + clap * 0.6)) * 0.8


def hat(open_=False, g=1.0):
    t = tt(0.3 if open_ else 0.05)
    return filt("high", rng.standard_normal(len(t)), 7500, 3) * np.exp(-t * (10 if open_ else 80)) * 0.3 * g


def shaker():
    t = tt(0.08)
    return filt("band", rng.standard_normal(len(t)), (5000, 11000)) * np.minimum(1, t / 0.02) * np.exp(-t * 45) * 0.16


def crackle(d):
    n = int(d * SR); c = np.zeros(n)
    idx = rng.integers(0, n, int(d * 70)); c[idx] = rng.uniform(-1, 1, len(idx))
    return filt("low", c, 6000) * 0.5 + filt("high", rng.standard_normal(n), 2500) * 0.01


def scratch(d=0.42):
    t = tt(d)
    ph = np.sin(2 * np.pi * 7.5 * t)                        # the hand going back and forth
    f = 500 + 900 * np.abs(ph)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    nz = filt("band", rng.standard_normal(len(t)), (800, 3500))
    gate = (np.abs(ph) > 0.25).astype(float)
    return (tone * 0.5 + nz * 0.5) * gate * np.exp(-t * 1.5) * 0.5


def needle():
    t = tt(0.25)
    return filt("low", rng.standard_normal(len(t)), 1800) * np.exp(-t * 30) * 0.9


# ---- tones ----
def rhodes(midis, d):
    t = tt(d); s = np.zeros(len(t))
    for m in midis:
        f = nf(m)
        s += np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * t) * np.exp(-t * 4))
        s += 0.18 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6)
    trem = 1 + 0.18 * np.sin(2 * np.pi * 4.5 * t)
    e = np.minimum(1, t / 0.006) * np.exp(-t * 1.1)
    e[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))
    return filt("low", s * e * trem, 3200) * 0.16


def bassnote(m, d):
    t = tt(d); f = nf(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.1 * np.sin(2 * np.pi * 3 * f * t)
    e = np.minimum(1, t / 0.005) * np.exp(-t * 2.4)
    e[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
    return np.tanh(1.4 * s * e) * 0.55


def whistle(m, d):
    t = tt(d); f = nf(m) * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.15))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.04 * filt("band", rng.standard_normal(len(t)), (2000, 6000))
    e = np.minimum(1, t / 0.02) * np.exp(-t * 2.5)
    e[-int(0.04 * SR):] *= np.linspace(1, 0, int(0.04 * SR))
    return s * e * 0.24


def horn(midis, d=0.28):
    t = tt(d); s = np.zeros(len(t))
    for m in midis:
        f = nf(m)
        for k, det in enumerate((-0.006, 0, 0.006)):
            ph = (f * (1 + det) * t + k * 0.3) % 1
            s += (2 * ph - 1)
    env_cut = 600 + 3800 * np.exp(-t * 14)
    out = np.zeros(len(t)); seg = 256
    for i in range(0, len(t), seg):
        out[i:i + seg] = filt("low", s[i:i + seg], env_cut[i])
    e = np.minimum(1, t / 0.01) * np.exp(-t * 7)
    return np.tanh(out * e * 0.35) * 0.55


# ---- song ----
# I – vi – ii – V in Eb:  Ebmaj7, Cm9, Fm9, Bb13
CH = [[51, 55, 58, 62], [48, 55, 58, 62], [53, 56, 60, 63], [50, 55, 58, 62]]   # voicings (midi)
BASS = [39, 36, 41, 34]                                                          # Eb2 C2 F2 Bb1
HORN = [[63, 67, 70], [63, 67, 70], [65, 68, 72], [62, 65, 70]]
# the hook: two bars, (16th step, midi, length in 16ths)
HOOK = [(0, 79, 2), (2, 82, 2), (4, 84, 3), (7, 82, 1), (8, 79, 2), (10, 77, 2), (12, 75, 4),
        (16, 79, 2), (18, 82, 2), (20, 84, 2), (22, 87, 2), (24, 84, 3), (27, 82, 1), (28, 84, 4)]


def drums(bar, thin=False, fill=False):
    for st in ((0, 7, 10) if not thin else (0,)):
        add(kick(), T(bar, st), 1.0)
    for st in (4, 12):
        add(snare(), T(bar, st), 0.95 if not thin else 0.7, pan=0.05)
    if not thin:
        for st in range(16):
            add(hat(st == 14, 1.0 if st % 2 == 0 else 0.55), T(bar, st), 0.9, pan=0.28)
            if st % 2 == 1:
                add(shaker(), T(bar, st), 1.0, pan=-0.35)
    if fill:
        for k in range(4):
            add(snare(), T(bar, 12 + k), 0.35 + 0.12 * k)


def keys(bar, i, g=1.0, cut=None):
    c = CH[i % 4]
    for st, ln in ((0, 6), (6, 4), (10, 6)):          # comped on the push
        s = rhodes(c, ln * S16 + 0.05)
        if cut:
            s = filt("low", s, cut)
        add(s, T(bar, st), g, pan=-0.1)


def bass(bar, i):
    r = BASS[i % 4]
    for st, m, ln in ((0, r, 3), (3, r, 1), (6, r + 12, 2), (10, r + 7, 2), (14, r + 10, 2)):
        add(bassnote(m, ln * S16), T(bar, st), 1.0)


def hook(bar_pair_start, g=1.0):
    for st, m, ln in HOOK:
        b = bar_pair_start + st // 16
        add(whistle(m, ln * S16 + 0.04), T(b, st % 16), g, pan=0.2)
        add(whistle(m, ln * S16) * 0.25, T(b, st % 16) + 3 * S16, g, pan=-0.45)


def horns(bar, i):
    h = HORN[i % 4]
    for st in (0, 3, 6):
        add(horn(h), T(bar, st), 0.9, pan=0.12)


# bar 0 — intro
add(crackle(BARS * BAR + 1.8), 0.0, 1.0)
keys(0, 0, 0.9, cut=900)
add(needle(), T(1) - 0.02, 0.8)
add(scratch(), T(0, 13), 0.9)
# bars 1-3 — groove
for i, b in enumerate((1, 2, 3)):
    drums(b, fill=(b == 3)); keys(b, i); bass(b, i)
hook(1, 1.0)
# bar 4 — horns in
drums(4); keys(4, 3); bass(4, 3); horns(4, 3); hook(4, 0.0)
# bar 5 — break
drums(5, thin=True); keys(5, 0, 1.1); add(scratch(0.3), T(5, 14), 0.8)
# bars 6-7 — full
for i, b in enumerate((6, 7)):
    drums(b, fill=(b == 7)); keys(b, i + 1); bass(b, i + 1); horns(b, i + 1)
hook(6, 0.9)
# bar 8 — outro: stab, kick, ring out on the Rhodes
add(kick(), T(8), 1.0); add(snare(), T(8, 4), 0.9)
add(horn(HORN[0], 0.6), T(8), 1.0)
add(rhodes(CH[0], BAR * 1.4), T(8), 1.1)
add(bassnote(BASS[0], BAR), T(8), 1.0)
for st in (0, 2, 4, 6):
    add(hat(False), T(8, st), 0.6, pan=0.28)

# ---- master ----
mix = np.stack([L, R], 1)
b, a = butter(2, 30 / (SR / 2), btype="high")
mix = lfilter(b, a, mix, axis=0)
mix = np.tanh(1.2 * mix / np.max(np.abs(mix)) * 1.5) / np.tanh(1.8)
end = int(SR * (BARS * BAR + 1.6)); mix = mix[:end]
fade = int(1.0 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = mix / np.max(np.abs(mix)) * 0.89
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-c:a", "libmp3lame", "-b:a", "256k", sys.argv[1]], input=(mix * 32767).astype("<i2").tobytes(), check=True)
print("wrote", sys.argv[1], round(end / SR, 2), "s; bar", BAR)
