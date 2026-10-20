"""Small DSP helpers: decode, BS.1770 loudness, trim, loop crossfade, MP3 encode."""
import subprocess, os, tempfile, numpy as np, imageio_ffmpeg
from scipy.signal import lfilter

FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 44100


def load(path, ch=1, sr=SR):
    b = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(sr), '-f', 'f32le', '-'],
                       capture_output=True, check=True).stdout
    x = np.frombuffer(b, np.float32).astype(np.float64)
    return x.reshape(-1, ch) if ch > 1 else x


def _kfilters(fs=SR):
    G, fc, Q = 3.99984385397, 1681.9744509555319, 0.7071752369554193
    A = 10 ** (G / 40); w0 = 2 * np.pi * fc / fs; al = np.sin(w0) / (2 * Q); c = np.cos(w0); sA = np.sqrt(A)
    b1 = [A * ((A + 1) + (A - 1) * c + 2 * sA * al), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - 2 * sA * al)]
    a1 = [(A + 1) - (A - 1) * c + 2 * sA * al, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - 2 * sA * al]
    fc, Q = 38.13547087613982, 0.5003270373253953
    w0 = 2 * np.pi * fc / fs; al = np.sin(w0) / (2 * Q); c = np.cos(w0)
    b2 = [(1 + c) / 2, -(1 + c), (1 + c) / 2]; a2 = [1 + al, -2 * c, 1 - al]
    return (b1, a1), (b2, a2)


def lufs(x, fs=SR):
    """Integrated loudness (BS.1770-4). Clips shorter than 400 ms use one block."""
    X = x if x.ndim == 2 else x[:, None]
    (b1, a1), (b2, a2) = _kfilters(fs)
    y = lfilter(b2, a2, lfilter(b1, a1, X, axis=0), axis=0)
    n = int(0.4 * fs); h = int(0.1 * fs)
    if len(y) <= n:
        z = (y ** 2).mean(axis=0).sum()
        return -0.691 + 10 * np.log10(z + 1e-12)
    zs = np.array([(y[i:i + n] ** 2).mean(axis=0).sum() for i in range(0, len(y) - n + 1, h)])
    L = -0.691 + 10 * np.log10(zs + 1e-12)
    zs = zs[L > -70]
    if not len(zs):
        return -70.0
    rel = -0.691 + 10 * np.log10(zs.mean()) - 10
    zz = zs[(-0.691 + 10 * np.log10(zs)) > rel]
    return -0.691 + 10 * np.log10(zz.mean())


def limit(x, ceil_db=-1.0, look=0.0015, rel=0.06, fs=SR):
    """Lookahead peak limiter (mono or stereo)."""
    from scipy.ndimage import minimum_filter1d
    a = np.abs(x if x.ndim == 1 else x.max(axis=1))
    c = 10 ** (ceil_db / 20)
    r = np.minimum(1.0, c / np.maximum(a, 1e-9))
    L = max(1, int(look * fs))
    r = minimum_filter1d(r, size=2 * L + 1)
    k = np.exp(-1.0 / (rel * fs)); g = np.empty_like(r); y = 1.0
    for i in range(len(r)):
        y = min(r[i], k * y + (1 - k) * r[i]); g[i] = y
    out = (x.T * g).T
    return np.clip(out, -c, c)


def normalise(x, target, peak_db=-1.0, max_lim_db=9.0):
    """Gain to target LUFS; peaks above the ceiling go through the limiter,
    with at most max_lim_db of peak reduction (then the gain is lowered)."""
    L = lufs(x)
    g = 10 ** ((target - L) / 20)
    lim = 10 ** (peak_db / 20)
    pk = np.abs(x).max() * g
    if pk > lim * 10 ** (max_lim_db / 20):
        g = lim * 10 ** (max_lim_db / 20) / np.abs(x).max()
    y = x * g
    if np.abs(y).max() > lim:
        y = limit(y, peak_db)
        # one correction pass: limiting removes some loudness
        L2 = lufs(y)
        if L2 < target - 0.5:
            g2 = min(10 ** ((target - L2) / 20), 10 ** (3 / 20))
            y = limit(x * g * g2, peak_db) if np.abs(x * g * g2).max() <= lim * 10 ** ((max_lim_db + 3) / 20) else y
    return y, L, lufs(y)


def trim(x, thr_db=-48, pre=0.004, post=0.03, fs=SR):
    a = np.abs(x if x.ndim == 1 else x.max(axis=1))
    thr = 10 ** (thr_db / 20) * max(a.max(), 1e-9)
    idx = np.where(a > thr)[0]
    if not len(idx):
        return x
    s = max(0, idx[0] - int(pre * fs)); e = min(len(x), idx[-1] + int(post * fs))
    y = x[s:e].copy()
    fo = min(len(y) // 4, int(0.015 * fs))  # short fade-out so the tail never clicks
    if fo > 0:
        r = np.linspace(1, 0, fo)
        y[-fo:] = (y[-fo:].T * r).T
    fi = min(len(y) // 8, int(0.002 * fs))
    if fi > 0 and s > 0:
        y[:fi] = (y[:fi].T * np.linspace(0, 1, fi)).T
    return y


def fade_out(x, sec, fs=SR):
    n = min(len(x), int(sec * fs)); y = x.copy()
    y[-n:] = (y[-n:].T * np.linspace(1, 0, n) ** 2).T
    return y


def circ_loop(x, xf, fs=SR):
    """Seamless loop from any clip: the last xf seconds cross-fade into the start."""
    n = int(xf * fs); y = x[:len(x) - n].copy()
    t = np.linspace(0, 1, n); fi = np.sin(t * np.pi / 2); fo = np.cos(t * np.pi / 2)
    y[:n] = (x[:n].T * fi).T + (x[len(x) - n:].T * fo).T
    return y


def seg_loop(x, a, b, xf, fs=SR):
    """Loop x[a:b] (samples); the audio after b cross-fades into the start."""
    n = int(xf * fs); y = x[a:b].copy()
    t = np.linspace(0, 1, n); fi = np.sin(t * np.pi / 2); fo = np.cos(t * np.pi / 2)
    y[:n] = (x[a:a + n].T * fi).T + (x[b:b + n].T * fo).T
    return y


def feats(x, fs=SR, hop=0.05):
    m = x if x.ndim == 1 else x.mean(axis=1)
    H = int(hop * fs); N = 4096
    edges = np.geomspace(60, 12000, 25)
    f = np.fft.rfftfreq(N, 1 / fs)
    bands = [(f >= edges[i]) & (f < edges[i + 1]) for i in range(24)]
    F = []
    win = np.hanning(N)
    for i in range(0, len(m) - N, H):
        S = np.abs(np.fft.rfft(m[i:i + N] * win)) ** 2
        F.append([np.log10(S[b].sum() + 1e-9) for b in bands])
    return np.array(F), H


def find_loop(x, lo, hi, a_range=(0.5, 20), ctx=3.0, fs=SR):
    """Pick loop start a and end b (seconds) whose surroundings sound most alike."""
    F, H = feats(x, fs)
    hop = H / fs; W = int(ctx / hop); K = int(0.5 / hop)
    Fn = F - F.mean(axis=1, keepdims=True)
    best = (-9, 0, 0)
    dur = len(x) / fs
    for ai in range(int(a_range[0] / hop), int(min(a_range[1], dur - lo) / hop)):
        A = Fn[ai - K:ai + W].ravel() if ai >= K else None
        if A is None:
            continue
        A = A / (np.linalg.norm(A) + 1e-9)
        for bi in range(ai + int(lo / hop), min(ai + int(hi / hop), len(F) - W - 2)):
            B = Fn[bi - K:bi + W].ravel(); B = B / (np.linalg.norm(B) + 1e-9)
            s = float(A @ B)
            if s > best[0]:
                best = (s, ai, bi)
    s, ai, bi = best
    a = ai * H; b = bi * H
    # sample-level alignment of b to a by waveform cross-correlation (+-25 ms)
    m = x if x.ndim == 1 else x.mean(axis=1)
    L = int(0.05 * fs); R = int(0.025 * fs)
    ref = m[a:a + L]
    cc = [float(ref @ m[b + d:b + d + L]) for d in range(-R, R)]
    b = b + (int(np.argmax(cc)) - R)
    return a, b, s


def encode_mp3(x, path, kbps, ch=1, fs=SR):
    x = np.clip(x, -1, 1).astype(np.float32)
    raw = x.tobytes() if x.ndim == 1 else x.reshape(-1).tobytes()
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(fs), '-ac', str(ch), '-i', '-',
                    '-c:a', 'libmp3lame', '-b:a', f'{kbps}k', '-ac', str(ch), path], input=raw, check=True)
    return os.path.getsize(path)
