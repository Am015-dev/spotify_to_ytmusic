# glossStats (glossy-cars-r22e10): python3 tools/glossStats.py <prefix> [mood...]  reads <prefix>_<mood>_{off,on,mask}.png from tools/tGloss2.js and prints, on the
# player body (magenta mask): mean hue (circular, deg), mean saturation and value of the paint (brightest 5 % excluded = albedo), on vs off in %, plus the
# highlight: share of body pixels near white (V>.92, S<.3) and the 99th-percentile V.
import sys, colorsys, math
import numpy as np
from PIL import Image
pre = sys.argv[1]; moods = sys.argv[2:] or ['day', 'dusk']
def hsv(a):
    a = a.astype(np.float32) / 255; mx = a.max(1); mn = a.min(1); d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0); r, g, b = a[:, 0], a[:, 1], a[:, 2]; dd = np.maximum(d, 1e-6)
    h = np.where(mx == r, ((g - b) / dd) % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) * 60
    return h, s, mx
for m in moods:
    M = np.asarray(Image.open(f'{pre}_{m}_mask.png').convert('RGB')).reshape(-1, 3).astype(int)
    O = np.asarray(Image.open(f'{pre}_{m}_off.png').convert('RGB')).reshape(-1, 3).astype(int)
    k = (M[:, 0] > 180) & (M[:, 2] - M[:, 1] > 50) & (O[:, 2] - O[:, 1] < 30)   # pink after bloom/tone map, and not already pink in the off shot
    out = {}
    for t in ('off', 'on'):
        A = np.asarray(Image.open(f'{pre}_{m}_{t}.png').convert('RGB')).reshape(-1, 3)[k]
        h, s, v = hsv(A); cut = np.percentile(v, 95); a = v <= cut
        hm = math.degrees(math.atan2(np.sin(np.radians(h[a])).mean(), np.cos(np.radians(h[a])).mean())) % 360
        out[t] = dict(h=hm, s=s[a].mean(), v=v[a].mean(), vall=v.mean(), hi=((v > .92) & (s < .3)).mean() * 100, p99=np.percentile(v, 99))
    o, n = out['off'], out['on']; dh = (n['h'] - o['h'] + 180) % 360 - 180
    ok = abs(n['s'] / o['s'] - 1) <= .05 and abs(n['v'] / o['v'] - 1) <= .05 and abs(dh) <= 5
    print(f"{m}: px {k.sum()} | hue {o['h']:.1f}->{n['h']:.1f} ({dh:+.1f} deg) | sat {o['s']:.3f}->{n['s']:.3f} ({(n['s']/o['s']-1)*100:+.1f}%) | val {o['v']:.3f}->{n['v']:.3f} ({(n['v']/o['v']-1)*100:+.1f}%) | all-px val {(n['vall']/o['vall']-1)*100:+.1f}% | highlight px {o['hi']:.2f}%->{n['hi']:.2f}% p99V {o['p99']:.2f}->{n['p99']:.2f} | {'PASS' if ok else 'FAIL'} (+-5%)")
