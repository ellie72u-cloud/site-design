"""(engine shared with the KARGOS phonk bed): 130 BPM, 18 bars (33.23s), C# minor.

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
BPM = 140.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
BARS = 13
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



# ---------- LEFTOVRZ: street / drill-leaning, F minor ----------
def bell(freq, dur=0.9):
    n = int(dur * SR); t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * freq * 3.5 * t) * 2.2 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * freq * t + mod) * np.exp(-t * 3.2)
    s += 0.25 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t * 8)
    return s * np.minimum(1, t / 0.003) * 0.34

def slide808(f0, f1, dur, glide_at):
    n = int(dur * SR); t = np.arange(n) / SR
    f = np.where(t < glide_at, f0, f1 + (f0 - f1) * np.exp(-np.maximum(t - glide_at, 0) * 22))
    ph = 2 * np.pi * np.cumsum(f) / SR
    e = np.minimum(1, t / 0.004) * np.exp(-t * 1.8)
    rel = int(0.04 * SR); e[-rel:] *= np.linspace(1, 0, rel)
    return lp(np.tanh(2.6 * np.sin(ph) * e), 1600) * 0.55

def crackle(dur):
    n = int(dur * SR)
    c = np.zeros(n); idx = rng.integers(0, n, int(dur * 90)); c[idx] = rng.uniform(-1, 1, len(idx))
    return (lp(c, 5000) * 0.6 + hp(rng.standard_normal(n), 3000) * 0.012)

def snare():
    n = int(0.3 * SR); t = np.arange(n) / SR
    nz = bp(rng.standard_normal(n), 1500, 8000) * np.exp(-t * 22)
    body = np.sin(2 * np.pi * 210 * t) * np.exp(-t * 26)
    return np.tanh(1.8 * (nz * 0.8 + body * 0.7)) * 0.75

F5 = 698.46
def nb(semi): return F5 * 2 ** (semi / 12)
HOOK = [(0, 0), (3, -2), (6, -5), (8, -4), (10, -5), (12, -9), (14, -7)]
ANS  = [(0, 0), (3, -2), (6, -5), (8, -4), (10, -2), (11, 0), (12, 3), (14, 0)]
ROOTS = [87.31, 69.30, 77.78, 65.41]          # F2 Db2 Eb2 C2

def hook(bar, pat, g=1.0, cut=None):
    for st, se in pat:
        s = bell(nb(se))
        if cut: s = lp(s, cut)
        t0 = t_of(bar, st)
        add(s, t0, g, pan=-0.2); add(s * 0.3, t0 + 3 * S16, g, pan=0.55)

def drill(bar, roll_end=False, sparse=False):
    add(kick(), t_of(bar, 0), 1.0)
    if not sparse:
        add(kick(), t_of(bar, 10), 0.8)
    add(snare(), t_of(bar, 8), 1.0)
    for st in (0, 3, 6, 8, 11, 14):
        add(hat(), t_of(bar, st), 0.8, pan=0.3)
    if roll_end:                                # drill triplet roll into the next bar
        for k in range(6):
            add(hat(), t_of(bar, 12) + k * (S16 * 4 / 6), 0.45 + k * 0.07, pan=0.3)
    else:
        for k in range(3):
            add(hat(), t_of(bar, 4) + k * (S16 * 2 / 3), 0.5, pan=0.3)

def bass(bar, i):
    r = ROOTS[i % 4]
    add(slide808(r, r * 2, 10 * S16, 6 * S16), t_of(bar, 0), 1.0)
    add(slide808(r * 2, r, 5 * S16, 2 * S16), t_of(bar, 11), 0.9)

# intro: crackle, filtered hook, riser
add(crackle(4 * BEAT * 2), 0, 1.0)
hook(0, HOOK, 0.8, cut=1400); hook(1, ANS, 0.85, cut=2600)
add(riser(BAR * 0.8), t_of(2) - BAR * 0.8, 0.9); add(revcym(0.7), t_of(2) - 0.7, 0.8)
# main A: bars 2-7 (drop on the wordmark)
for i, b in enumerate(range(2, 8)):
    if b in (2, 5): add(crash(), t_of(b), 0.9)
    hook(b, HOOK if i % 2 == 0 else ANS)
    if b == 7:                                  # stop-down: last beat of bar 7 is silence
        add(kick(), t_of(b, 0), 1.0); add(snare(), t_of(b, 8), 1.0)
        for st in (0, 3, 6, 8, 11): add(hat(), t_of(b, st), 0.8, pan=0.3)
        add(slide808(ROOTS[i % 4], ROOTS[i % 4], 11 * S16, 99), t_of(b, 0), 1.0)
    else:
        drill(b, roll_end=(b in (4, 6)))
        bass(b, i)
add(boom(), t_of(2), 0.9)
# main B: bars 8-9 (vote, sell) — bigger, answer phrase up an octave on top
for i, b in enumerate((8, 9)):
    add(crash(), t_of(b), 0.9 if b == 8 else 0.5)
    hook(b, ANS); hook(b, [(st, se + 12) for st, se in HOOK[:4]], 0.35)
    drill(b, roll_end=(b == 9)); bass(b, i)
    add(clap(), t_of(b, 12), 0.5)
add(boom(), t_of(8), 1.0)
# outro: bars 10-12
for i, b in enumerate((10, 11, 12)):
    if b == 10: add(crash(), t_of(b), 1.0)
    hook(b, HOOK if i != 1 else ANS, 1.0 if b < 12 else 0.9)
    if b < 12:
        drill(b, roll_end=(b == 11)); bass(b, i)
    else:
        add(kick(), t_of(b, 0), 1.0)
        add(slide808(ROOTS[0], ROOTS[0] * 0.5, BAR * 1.2, BEAT * 1.5), t_of(b), 1.0)
        add(crash(), t_of(b), 0.8)
add(boom(), t_of(10), 1.0)
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
