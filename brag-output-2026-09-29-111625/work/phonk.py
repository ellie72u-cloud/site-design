"""KARGOS phonk-leaning bed: 130 BPM, 18 bars (33.23s), C# minor.

Sections (bar index -> what the video does there):
  0-1   intro: filtered cowbell hook, sub swell, riser        (the question)
  2-5   drop A: kick, clap, hats, 808, full cowbell          (logo lands on bar 2)
  6-13  section B: bigger hit, melody variation, open hats   (ANYWHERE on bar 6)
  14    breakdown: drums out, cowbell + 808 only             (provider panel)
  15    build: snare roll, riser                             (placements)
  16-17 final drop, ring out                                 (FROM. TO. WHEN.)
"""
import numpy as np
from scipy.signal import butter, lfilter
import subprocess, sys

SR = 44100
BPM = 130.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
BARS = 18
N = int(SR * (BARS * BAR + 1.2))
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)


def t_of(bar, step=0):
    return bar * BAR + step * S16


def bp(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    return lfilter(b, a, x)


def hp(x, f, order=2):
    b, a = butter(order, f / (SR / 2), btype="high")
    return lfilter(b, a, x)


def lp(x, f, order=2):
    b, a = butter(order, min(f, SR / 2 - 100) / (SR / 2), btype="low")
    return lfilter(b, a, x)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    r = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    L[i:i + len(sig)] += sig * l
    R[i:i + len(sig)] += sig * r


def env(n, a, d):
    t = np.arange(n) / SR
    e = np.exp(-t * d)
    if a > 0:
        e *= np.minimum(1, t / a)
    return e


# ---------- instruments ----------
def kick():
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    s += 0.35 * hp(rng.standard_normal(n), 2500) * np.exp(-t * 180)
    return np.tanh(2.2 * s) * 0.9


def clap():
    n = int(0.35 * SR); t = np.arange(n) / SR
    nz = bp(rng.standard_normal(n), 900, 5200)
    e = np.zeros(n)
    for k, o in enumerate([0, 0.011, 0.022]):
        i = int(o * SR); e[i:] += np.exp(-(t[: n - i]) * (60 if k < 2 else 16))
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 30) * 0.5
    return np.tanh(1.6 * (nz * e + body)) * 0.7


def hat(open_=False):
    n = int((0.32 if open_ else 0.06) * SR)
    s = hp(rng.standard_normal(n), 7200, 3)
    return s * env(n, 0, 9 if open_ else 70) * 0.35


def crash():
    n = int(1.8 * SR)
    s = hp(rng.standard_normal(n), 4200, 2)
    return s * env(n, 0.002, 2.4) * 0.32


def cowbell(freq, dur=0.34):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * freq * t)) + 0.8 * np.sign(np.sin(2 * np.pi * freq * 1.4814 * t))
    s = bp(s, freq * 0.9, freq * 3.2)
    s = s * (np.exp(-t * 7) * 0.75 + np.exp(-t * 40) * 0.6) * np.minimum(1, t / 0.002)
    return s * 0.52


def sub808(freq, dur, glide_from=None):
    n = int(dur * SR); t = np.arange(n) / SR
    f = np.full(n, freq)
    if glide_from:
        f = freq + (glide_from - freq) * np.exp(-t * 18)
    ph = 2 * np.pi * np.cumsum(f) / SR
    e = np.minimum(1, t / 0.004) * np.exp(-t * 2.4)
    rel = int(0.05 * SR)
    if n > rel:
        e[-rel:] *= np.linspace(1, 0, rel)
    s = np.sin(ph) * e
    s = np.tanh(3.2 * s)                       # the growl phone speakers can hear
    return lp(s, 1800) * 0.5


def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    nz = rng.standard_normal(n)
    out = np.zeros(n); seg = int(0.05 * SR)
    for i in range(0, n, seg):             # a band that climbs
        f = 400 + 7000 * (i / n) ** 2
        chunk = nz[i:i + seg]
        out[i:i + len(chunk)] = bp(chunk, f, min(f * 1.8, 18000))
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / dur) ** 2) / SR) * 0.15
    return (out * 0.25 + tone) * (t / dur) ** 1.6


def boom():
    n = int(1.6 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.2)
    return np.tanh(2 * s) * 0.8


def revcym(dur):
    c = crash()[: int(dur * SR)]
    return c[::-1] * 0.9


# ---------- the music ----------
ROOT = 554.37                                  # C#5 for the cowbell
def nt(semi, base=ROOT):
    return base * 2 ** (semi / 12)

# two-bar hook, 16th steps: (step, semitone)
HOOK_A = [(0, 0), (3, 0), (6, 3), (8, 0), (10, 7), (12, 3), (14, 0)]
HOOK_B = [(0, 0), (3, 0), (6, 3), (8, 10), (10, 7), (11, 8), (12, 7), (14, 3)]
# section B answers higher
HOOK_C = [(0, 12), (3, 12), (6, 10), (8, 7), (10, 10), (12, 7), (13, 8), (14, 3)]
HOOK_D = [(0, 0), (2, 3), (4, 7), (6, 10), (8, 12), (10, 10), (12, 7), (14, 3)]

BASS_ROOTS = [69.30, 55.00, 61.74, 51.91]      # C#2, A1, B1, G#1  (i VI VII v)


def play_hook(bar, pat, gain, cutoff=None):
    for step, semi in pat:
        s = cowbell(nt(semi))
        if cutoff:
            s = lp(s, cutoff)
        t0 = t_of(bar, step)
        add(s, t0, gain, pan=-0.15)
        add(s * 0.35, t0 + 3 * S16, gain, pan=0.6)     # dotted-eighth echo, wide
        add(s * 0.15, t0 + 6 * S16, gain, pan=-0.6)


def drums(bar, open_hats=False, fill=False, kick_pat=(0, 7, 8, 10)):
    for st in kick_pat:
        add(kick(), t_of(bar, st), 1.0)
    for st in (4, 12):
        add(clap(), t_of(bar, st), 0.95, pan=0.05)
    for st in range(0, 16, 2):
        add(hat(open_hats and st in (6, 14)), t_of(bar, st), 0.9 if st % 4 else 0.6, pan=0.3)
    if fill:                                   # hat roll into the next bar
        for k in range(8):
            add(hat(), t_of(bar, 12) + k * S16 / 2, 0.5 + k * 0.05, pan=0.3)
        for k in range(4):
            add(clap(), t_of(bar, 12) + k * S16, 0.35 + k * 0.12)


def bass(bar, note_idx, pattern=((0, 6), (7, 3), (10, 6))):
    f = BASS_ROOTS[note_idx % 4]
    for st, ln in pattern:
        g = f * 1.5 if st == 0 else None
        add(sub808(f, ln * S16, g), t_of(bar, st), 1.0)


# intro (bars 0-1): filtered hook opening up, sub swell, riser
for b in (0, 1):
    play_hook(b, HOOK_A if b == 0 else HOOK_B, 0.8, cutoff=900 if b == 0 else 2200)
add(sub808(69.30, BAR * 2 - 0.1) * 0.5, 0.0, 0.8)
add(riser(BAR * 0.9), t_of(1, 16) - BAR * 0.9, 0.9)
add(revcym(0.9), t_of(2) - 0.9, 0.8)

# drop A (bars 2-5)
for i, b in enumerate(range(2, 6)):
    add(crash() if b == 2 else np.zeros(1), t_of(b), 1.0)
    play_hook(b, HOOK_A if i % 2 == 0 else HOOK_B, 1.0)
    drums(b, fill=(b == 5), kick_pat=(0, 7, 8, 10) if b != 5 else (0, 7, 8))
    bass(b, i)
add(boom(), t_of(2), 0.8)
# the board: a rising tick on each beat of bar 5's last half is the fill; a gap before ANYWHERE
add(revcym(0.6), t_of(6) - 0.6, 0.7)

# section B (bars 6-13)
for i, b in enumerate(range(6, 14)):
    if b in (6, 10):
        add(crash(), t_of(b), 1.0)
    pat = [HOOK_C, HOOK_D, HOOK_A, HOOK_B][i % 4]
    play_hook(b, pat, 1.0)
    drums(b, open_hats=True, fill=(b in (9, 13)))
    bass(b, i, pattern=((0, 5), (6, 2), (8, 4), (13, 3)) if i % 2 else ((0, 6), (7, 3), (10, 6)))
add(boom(), t_of(6), 1.0)

# breakdown (bar 14): drums out, filtered hook, long 808
play_hook(14, HOOK_A, 0.9, cutoff=1600)
add(sub808(69.30, BAR - 0.05, 69.30 * 1.5), t_of(14), 0.9)
# build (bar 15): kick on quarters, snare roll, riser
for st in range(0, 16, 4):
    add(kick(), t_of(15, st), 0.9)
for k in range(16):
    add(clap(), t_of(15, k), 0.25 + 0.045 * k, pan=0.05)
play_hook(15, HOOK_B, 0.7, cutoff=3000)
add(riser(BAR), t_of(15), 1.1)

# final drop (bars 16-17), ring out on bar 17 beat 3
for i, b in enumerate((16, 17)):
    add(crash(), t_of(b) if b == 16 else 0, 1.0 if b == 16 else 0)
    play_hook(b, HOOK_C if i == 0 else HOOK_A, 1.0)
    if b == 16:
        drums(b, open_hats=True)
        bass(b, 0)
    else:
        for st in (0, 7, 8):
            add(kick(), t_of(b, st), 1.0)
        add(clap(), t_of(b, 4), 0.95)
        add(sub808(69.30, BAR * 1.4, 69.30 * 1.5), t_of(b), 1.0)
add(boom(), t_of(16), 1.1)
add(crash(), t_of(17, 8), 0.8)

# ---------- master ----------
mix = np.stack([L, R], axis=1)
mix = hp(mix.T, 28).T                        # clear the rumble below the 808
peak = np.max(np.abs(mix)) or 1
mix = np.tanh(1.25 * mix / peak * 1.6) / np.tanh(1.25 * 1.6)
end = int(SR * (BARS * BAR + 1.0))
fade = int(0.8 * SR)
mix = mix[:end]
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = mix / np.max(np.abs(mix)) * 0.89
pcm = (mix * 32767).astype("<i2").tobytes()
out = sys.argv[1]
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-c:a", "libmp3lame", "-b:a", "256k", out], input=pcm, check=True)
print("wrote", out, round(end / SR, 2), "s; bar", round(BAR, 4))
