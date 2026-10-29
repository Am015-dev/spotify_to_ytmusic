#!/usr/bin/env python3
# Expand the SMALL-MOTION sprite strips (idle, hover, flame, glow, loop) with one computed in-between frame per pair (frames x2, fps x2).
#   python3 games-src/scripts/strip-expand.py            # all in-scope strips (run from the repo root; needs opencv-python-headless)
#   python3 games-src/scripts/strip-expand.py kai/idle   # only these (who/act)
#   python3 games-src/scripts/strip-expand.py --pack <outdir> kai/idle ...   # old/new GIFs + before/after PNG for a look, nothing else written
# Writes media/anim/<who>/<act>x2-strip.webp (lossless, originals pixel-identical and in order, loop closed) and sheets/<who>/<act>x2-strip.json,
# lists them in media/ready.json, and a report sheets/expand-report.json. A strip whose check fails is NOT written (it is listed as rejected).
# The original strips are never touched. Large-motion acts (run, melee, attack, jump, ...) and every fx/muzzle/impact/burst are out of scope.
import sys, os, json
import numpy as np, cv2
from PIL import Image

# W265 LOOK (contact sheets old/new, every strip): dropped although the numbers pass: kai/idle soft in-betweens + grey smear behind the boots; gunman, jetpack/hover (ghost doubled gun arm / flame);
# prop-holo (glitch frames blur into ghosts); boss-kronos (spikes smear / double); ship-ebait (bright flame blob); ship-egate (beacon ghost); ship-esplitter + ship-emine (doubled flame / spike);
# ship-eshielder, ship-hv (grey streak behind the flame)
SKIP = {'kai/idle', 'gunman/idle', 'jetpack/hover', 'prop-holo/loop', 'boss-kronos/idle', 'ship-ebait/flame', 'ship-egate/flame', 'ship-esplitter/flame', 'ship-emine/flame', 'ship-eshielder/flame', 'ship-hv/flame'}
ACTS = ('idle', 'hover', 'flame', 'glow', 'loop')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MEDIA = ROOT + '/games/mainhattan-nightrun/media/'
SHEETS = ROOT + '/games-src/anims/mainhattan-nightrun/sheets/'
LIM = dict(ghost=2.0, overlap=0.88, drift=6.0)   # the gate from the brief: semi-transparent area <= 2x the larger neighbour, silhouette overlap >= 88%, colour drift < 6 / channel

ENC = dict(lossy=os.environ.get('EXPAND_LOSSY') == '1', q=90, tol=int(os.environ.get('EXPAND_TOL', 1)))   # W265: lossless max effort (method 6) by default; EXPAND_LOSSY=1 = webp q90 (alpha q100), kept only if the originals stay within EXPAND_TOL levels

def split(path, n, w):
    im = np.array(Image.open(path).convert('RGBA'))
    return [im[:, i * w:(i + 1) * w].copy() for i in range(n)]
def f32(u8): return u8.astype(np.float32) / 255
def pm(f): a = f[..., 3:4]; return np.concatenate([f[..., :3] * a, a], -1)
def unpm(f):
    a = np.clip(f[..., 3:4], 0, 1); rgb = np.where(a > 1e-3, f[..., :3] / np.maximum(a, 1e-3), 0)
    return np.concatenate([np.clip(rgb, 0, 1), a], -1)
def gray(f): return (np.clip(0.6 * (0.299 * f[..., 0] + 0.587 * f[..., 1] + 0.114 * f[..., 2]) + 0.4 * f[..., 3], 0, 1) * 255).astype(np.uint8)

def mid(a8, b8, t=0.5):
    A, B = pm(f32(a8)), pm(f32(b8)); h, w = A.shape[:2]
    if np.array_equal(a8, b8): return a8.copy()
    F = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM).calc(gray(A), gray(B), None)
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    m0 = cv2.remap(A, gx - t * F[..., 0], gy - t * F[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)   # premultiplied warp: no coloured halo at the edge
    m1 = cv2.remap(B, gx + (1 - t) * F[..., 0], gy + (1 - t) * F[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    return (unpm((1 - t) * m0 + t * m1) * 255 + 0.5).astype(np.uint8)

def semi(f): a = f[..., 3]; return int(((a > 12) & (a < 243)).sum())
def sil(f): return f[..., 3] > 127
def meancol(f):
    a = f32(f)[..., 3:4]; s = a.sum()
    return (f32(f)[..., :3] * a).sum((0, 1)) / s * 255 if s > 1 else np.zeros(3)
def check(m, a, b):
    """-> (ok, metrics) for one in-between m between neighbours a, b"""
    sm, sn = semi(m), max(semi(a), semi(b), 50)
    ov = []
    for n in (a, b):
        u = (sil(m) | sil(n)).sum(); ov.append(1.0 if u == 0 else (sil(m) & sil(n)).sum() / u)
    dr = float(np.abs(meancol(m) - (meancol(a) + meancol(b)) / 2).max())
    r = dict(ghost=round(sm / sn, 2), overlap=round(min(ov), 3), drift=round(dr, 1))
    return (r['ghost'] <= LIM['ghost'] and r['overlap'] >= LIM['overlap'] and r['drift'] < LIM['drift']), r

def expand(fr):
    out, rep, ok = [], [], True; n = len(fr)
    for i in range(n):
        out.append(fr[i]); j = (i + 1) % n   # the last pair closes the loop (last -> first)
        m = mid(fr[i], fr[j]); good, r = check(m, fr[i], fr[j]); ok &= good; rep.append(r); out.append(m)
    return out, ok, rep

def strips(only):
    for who in sorted(os.listdir(SHEETS)):
        if not os.path.isdir(SHEETS + who): continue
        for act in ACTS:
            if os.path.exists(f'{SHEETS}{who}/{act}-strip.json') and os.path.exists(f'{MEDIA}anim/{who}/{act}-strip.webp') and (not only or f'{who}/{act}' in only) and f'{who}/{act}' not in SKIP:
                yield who, act

def build(who, act, write=True):
    j = json.load(open(f'{SHEETS}{who}/{act}-strip.json')); n, w, h = j['frames'], j['w'], j['h']
    fr = split(f'{MEDIA}anim/{who}/{act}-strip.webp', n, w)
    out, ok, rep = expand(fr)
    same = all(np.array_equal(out[2 * i], fr[i]) for i in range(n))   # first / last / all originals kept pixel-identical, in order
    ok &= same
    res = dict(frames=[n, len(out)], fps=[j['fps'], j['fps'] * 2], ok=bool(ok), worst=dict(ghost=max(r['ghost'] for r in rep), overlap=min(r['overlap'] for r in rep), drift=max(r['drift'] for r in rep)))
    if ok and write:
        dst = f'{MEDIA}anim/{who}/{act}x2-strip.webp'; im = Image.fromarray(np.concatenate(out, 1), 'RGBA')
        im.save(dst, quality=ENC['q'], alpha_quality=100, method=6) if ENC['lossy'] else im.save(dst, lossless=True, exact=True, quality=100, method=6)
        back = split(dst, 2 * n, w)   # re-read what was written: the originals must survive the encode (lossless: identical; lossy: worst premultiplied level error is reported and must be <= ENC['tol'])
        err = max(int(np.abs(pm(f32(back[2 * i])) * 255 - pm(f32(fr[i])) * 255).max() + .5) for i in range(n)); res['orig_err'] = err; res['bytes'] = os.path.getsize(dst)
        if err > (ENC['tol'] if ENC['lossy'] else 0): os.remove(dst); res['ok'] = False; res['why'] = 'encode changed an original'; return res, fr, out
        k = dict(j); k['frames'] = 2 * n; k['fps'] = j['fps'] * 2
        if 'order' in j: k['order'] = [x for o in j['order'] for x in (o, o + '~mid')]
        k['expanded'] = dict(of=f'{act}-strip', k=1, loop=True, note='even frames = the original strip, odd frames = computed in-betweens (strip-expand.py)')
        json.dump(k, open(f'{SHEETS}{who}/{act}x2-strip.json', 'w'), indent=1)
    return res, fr, out

def onwhite(f): a = f[..., 3:4].astype(np.float32) / 255; return (f[..., :3] * a + 255 * (1 - a)).astype(np.uint8)
def pack(who, act, sp):
    res, fr, out = build(who, act, write=False)
    j = json.load(open(f'{SHEETS}{who}/{act}-strip.json')); sc = 2
    row = lambda L: np.concatenate([cv2.resize(onwhite(f), None, fx=sc, fy=sc, interpolation=cv2.INTER_CUBIC) for f in L], 1)
    a, b = row(fr), row(out); W = max(a.shape[1], b.shape[1]); H = a.shape[0]
    cv = np.full((2 * H + 10, W, 3), 255, np.uint8); cv[:H, :a.shape[1]] = a; cv[H + 10:, :b.shape[1]] = b
    Image.fromarray(cv).save(f'{sp}/{who}-{act}-before-after.png')
    gif = lambda L, fps, p: (lambda ims: ims[0].save(p, save_all=True, append_images=ims[1:], duration=int(1000 / fps), loop=0))([Image.fromarray(onwhite(f)).resize((j['w'] * sc, j['h'] * sc)) for f in L])
    gif(fr, j['fps'], f'{sp}/{who}-{act}-old.gif'); gif(out, j['fps'] * 2, f'{sp}/{who}-{act}-new.gif')
    print(who, act, res)

def main(a):
    if a and a[0] == '--pack':
        os.makedirs(a[1], exist_ok=True)
        for s in a[2:]: pack(*s.rsplit('/', 1), a[1])
        return
    only = set(a); rep = {}; done = []
    if not only:   # a full run starts clean: x2 files of strips that are now rejected or skipped are removed
        for who in os.listdir(SHEETS):
            for act in ACTS:
                for f in (f'{MEDIA}anim/{who}/{act}x2-strip.webp', f'{SHEETS}{who}/{act}x2-strip.json'):
                    if os.path.exists(f): os.remove(f)
    for who, act in strips(only):
        res, _, _ = build(who, act); rep[f'{who}/{act}'] = res
        print(('OK   ' if res['ok'] else 'FAIL ') + f'{who}/{act}', res['frames'], res['worst'])
        if res['ok']: done.append(f'anim/{who}/{act}x2-strip.webp')
    if not only:   # a partial run never rewrites the report or the manifest
        json.dump(rep, open(SHEETS + 'expand-report.json', 'w'), indent=1)
        rd = json.load(open(MEDIA + 'ready.json')); rd = sorted(set(x for x in rd if not x.endswith('x2-strip.webp')) | set(done))
        json.dump(rd, open(MEDIA + 'ready.json', 'w'), separators=(',', ':'))
    print(len(done), 'written,', sum(1 for r in rep.values() if not r['ok']), 'rejected:', [k for k, r in rep.items() if not r['ok']])

if __name__ == '__main__': main(sys.argv[1:])
