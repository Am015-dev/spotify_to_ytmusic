#!/usr/bin/env python3
"""Placeholder art for Mainhattan Nightrun.
  python3 games-src/nightrun/make-placeholders.py
Reads assets-manifest.json. For every file listed there that does not exist yet in games/mainhattan-nightrun/media/ it writes a labelled placeholder WebP (never overwrites real art),
and it regenerates ASSETS-NEEDED.md. To replace a placeholder: save your real image under the same file name and size (see the table), run this script (it updates media/ready.json) and commit both.
To ask for a new asset: add an entry to assets-manifest.json and run this script."""
import json, os, glob, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); MEDIA = os.path.normpath(os.path.join(HERE, '..', '..', 'games', 'mainhattan-nightrun', 'media'))
M = json.load(open(os.path.join(HERE, 'assets-manifest.json')))
COL = {'Garage kit perks': (255, 90, 61), 'Garage SOON cards': (140, 134, 184), 'Stage medals': (255, 176, 32), 'Difficulty badges': (255, 45, 149), 'Boss chest reveal': (255, 225, 77), 'Enemies': (25, 227, 255),
       'Effects': (61, 255, 176), 'Planned ships': (192, 138, 255), 'Mini-bosses': (255, 64, 96), 'Portrait parallax': (91, 140, 255), 'Weapons': (182, 255, 90), 'Weapon fusions': (255, 225, 77), 'Achievements': (255, 210, 61), 'Story cast': (255, 176, 32), 'On-foot street stage': (255, 140, 60), 'Effects (wave 8)': (61, 255, 176)}
def font(sz):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    return ImageFont.load_default()
def glow(e):
    """Effects (wave 8): a glowing coloured shape with the file id, light effects on pure black (the loader keys the black), solid objects on flat white. Never shown in the game (not listed in ready.json)."""
    from PIL import ImageFilter
    w, h = e['w'], e['h']; ph = e.get('ph') or {}; c = ph.get('c', '#3dffb0').lstrip('#'); c = tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)); sh = ph.get('shape', 'orb')
    white = e.get('bg') == 'white'; bg = (255, 255, 255) if white else (0, 0, 0)
    lay = Image.new('RGB', (w, h), (0, 0, 0)); d = ImageDraw.Draw(lay); cx, cy = w // 2, h // 2; m = min(w, h); wide = w >= 3 * h
    if sh in ('streak', 'beam', 'line', 'missile', 'bolt') or wide:
        th = max(2, h // (3 if wide else 5)); x0 = int(w * .08); d.rounded_rectangle([x0, cy - th, w - x0 - (m // 6 if not wide else 0), cy + th], radius=th, fill=c)
        if sh != 'line' and not wide: d.ellipse([w - m // 2, cy - m // 5, w - m // 12, cy + m // 5], fill=(255, 255, 255))
    elif sh == 'ring': d.ellipse([m // 8, m // 8, w - m // 8, h - m // 8], outline=c, width=max(3, m // 14))
    elif sh == 'burst':
        import math
        pts = []
        for i in range(24): a = i * math.pi / 12; r = m * (.42 if i % 2 == 0 else .2); pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        d.polygon(pts, fill=c); d.ellipse([cx - m // 8, cy - m // 8, cx + m // 8, cy + m // 8], fill=(255, 255, 255))
    elif sh in ('mine', 'disc', 'debris', 'blade', 'shell', 'crescent'):
        d.ellipse([cx - m // 4, cy - m // 4, cx + m // 4, cy + m // 4], fill=c, outline=(255, 255, 255), width=max(2, m // 40))
        for i in range(8):
            import math
            a = i * math.pi / 4; d.line([(cx + m * .25 * math.cos(a), cy + m * .25 * math.sin(a)), (cx + m * .36 * math.cos(a), cy + m * .36 * math.sin(a))], fill=c, width=max(2, m // 30))
    else: d.ellipse([cx - m // 4, cy - m // 4, cx + m // 4, cy + m // 4], fill=c); d.ellipse([cx - m // 9, cy - m // 9, cx + m // 9, cy + m // 9], fill=(255, 255, 255))
    soft = lay.filter(ImageFilter.GaussianBlur(max(2, m // 22)))
    if white:
        im = Image.new('RGB', (w, h), bg); im.paste(lay, (0, 0), lay.convert('L').point(lambda v: 255 if v > 8 else 0)); im = Image.blend(im, Image.composite(im, im, lay.convert('L')), 1)
    else:
        from PIL import ImageChops
        im = ImageChops.add(lay, soft)
    d = ImageDraw.Draw(im); base = e['file'].rsplit('.', 1)[0]; ink = (0, 0, 0) if white else (255, 255, 255)
    fs = max(8, min(w // 14, h // 4, 20))
    for t, y in ((base, h - fs * 2.6), ('PLACEHOLDER %dx%d' % (w, h), h - fs * 1.4)):
        f = font(fs)
        while d.textlength(t, font=f) > w - 8 and f.size > 6: f = font(f.size - 1)
        d.text(((w - d.textlength(t, font=f)) / 2, y), t, font=f, fill=ink)
    return im.convert('RGBA')
def shape34(e):
    """W34 placeholders (make-assets2.py): one flat text-free shape in the item's colour, at most 64 px on the long side (a few hundred bytes). Light effects sit on pure black, everything else on transparent. Never shown in the game (not listed in ready.json)."""
    import math
    w, h = e['w'], e['h']; k = min(1.0, 64.0 / max(w, h)); W, H = max(8, round(w * k)), max(8, round(h * k)); Q = 4
    ph = e.get('ph') or {}; c = ph.get('c', '#ffffff').lstrip('#'); c = tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)); sh = ph.get('shape', 'dot'); fx = e.get('kind') == 'fx'
    im = Image.new('RGBA', (W * Q, H * Q), (0, 0, 0, 255) if fx else (0, 0, 0, 0)); d = ImageDraw.Draw(im); cx, cy, r = W * Q / 2, H * Q / 2, min(W, H) * Q * .4; col = c + (255,); lw = max(2, int(r / 6))
    if sh == 'tri': d.polygon([(cx + r, cy), (cx - r, cy - r * .9), (cx - r, cy + r * .9)], fill=col)
    elif sh == 'dia': d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=col)
    elif sh == 'ring': d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=lw * 2)
    elif sh == 'cross': d.rectangle([cx - r, cy - r / 3, cx + r, cy + r / 3], fill=col); d.rectangle([cx - r / 3, cy - r, cx + r / 3, cy + r], fill=col)
    elif sh == 'star': d.polygon([(cx + (r if i % 2 == 0 else r * .45) * math.cos(i * math.pi / 5 - math.pi / 2), cy + (r if i % 2 == 0 else r * .45) * math.sin(i * math.pi / 5 - math.pi / 2)) for i in range(10)], fill=col)
    elif sh == 'hex': d.polygon([(cx + r * math.cos(i * math.pi / 3), cy + r * math.sin(i * math.pi / 3)) for i in range(6)], fill=col)
    elif sh == 'bar': d.rounded_rectangle([W * Q * .06, cy - H * Q * .3, W * Q * .94, cy + H * Q * .3], radius=lw * 2, fill=col)
    elif sh == 'band': d.rounded_rectangle([W * Q * .03, cy - min(H * Q * .22, W * Q * .4), W * Q * .97, cy + min(H * Q * .22, W * Q * .4)], radius=lw, fill=col)
    elif sh == 'swirl':
        pts = [(cx + r * t / 40 * math.cos(t * .5), cy + r * t / 40 * math.sin(t * .5)) for t in range(41)]; d.line(pts, fill=col, width=lw * 2)
    else: d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
    return im.resize((W, H), Image.LANCZOS)
def make(e):
    if e.get('w34'): return shape34(e)
    if e['group'] == 'Effects (wave 8)': return glow(e)
    w, h = e['w'], e['h']; c = COL.get(e['group'], (200, 200, 200)); fx = e['kind'] == 'fx'
    im = Image.new('RGBA', (w, h), (0, 0, 0, 255) if fx else (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle([1, 1, w - 2, h - 2], fill=(20, 12, 38, 255) if not fx else (10, 10, 10, 255), outline=c + (255,), width=max(2, w // 64))
    for i in range(-h, w, max(12, w // 10)): d.line([(i, h), (i + h, 0)], fill=c + (40,), width=1)             # hatching: obviously not final
    base = e['file'].rsplit('.', 1)[0]; fs = max(9, min(w // 9, h // 5, 28))
    lines = ['PLACEHOLDER', base, '%dx%d' % (w, h)]
    y = h // 2 - int(fs * 1.7)
    for i, t in enumerate(lines):
        f = font(fs if i else int(fs * .9)); tw = d.textlength(t, font=f)
        while tw > w - 8 and f.size > 7: f = font(f.size - 1); tw = d.textlength(t, font=f)
        d.text(((w - tw) / 2, y), t, font=f, fill=(255, 255, 255, 255) if i == 1 else c + (255,)); y += int(f.size * 1.35)
    return im
import hashlib
md5 = lambda p: hashlib.md5(open(p, 'rb').read()).hexdigest()
SIG = os.path.join(MEDIA, 'placeholders.json'); sig = json.load(open(SIG)) if os.path.exists(SIG) else {}
made = 0
for e in M:
    p = os.path.join(MEDIA, e['file'])
    if e.get('noph'): continue                       # 'noph': the game would show a placeholder (fxN preloads it), so no file is written until the real picture exists
    if not os.path.exists(p): os.makedirs(os.path.dirname(p), exist_ok=True); make(e).save(p, 'WEBP', quality=80, method=6); sig[e['file']] = md5(p); made += 1
print('placeholders written:', made, '| total in manifest:', len(M))
# ready.json: the manifest files whose picture is real art (not the placeholder we wrote). The game draws these and uses its own vector shapes for the rest.
ready = sorted(e['file'] for e in M if os.path.exists(os.path.join(MEDIA, e['file'])) and md5(os.path.join(MEDIA, e['file'])) != sig.get(e['file']))
# guard: a file that is not in placeholders.json (written by another tool) but is a placeholder render must never be listed as real art (placeholder_guard.py)
sys.path.insert(0, HERE); import placeholder_guard
_man = {e['file']: e for e in M}; refused = []
for n in list(ready):
    why = placeholder_guard.is_placeholder(os.path.join(MEDIA, n), _man, sig)
    if why: ready.remove(n); sig[n] = md5(os.path.join(MEDIA, n)); refused.append((n, why))
for n, why in refused: print('REFUSED (placeholder picture, not listed in ready.json):', n, '-', why)
ready += sorted(f for f in os.listdir(MEDIA) if f.startswith('mp-') and f.endswith('.mp3'))   # the music pack (parts/music/musicpack.js) is listed here too, never dropped
json.dump(sig, open(SIG, 'w'), indent=0); json.dump(ready, open(os.path.join(MEDIA, 'ready.json'), 'w'))
print('real art found for', len(ready), 'files:', ready)
# ----- the document -----
by = {}
for e in M:
    if not e.get('w34'): by.setdefault(e['group'], []).append(e)      # W34 files are listed in ASSETS-NEEDED-2.md (make-assets2.py)
out = ['# Nightrun: art and sound still needed', '', 'Generated by `make-placeholders.py` from `assets-manifest.json`. Every file below already exists as a labelled **placeholder** (hatched box with its name and size) in `games/mainhattan-nightrun/media/`.',
       '**To include real art:** save your image under the SAME file name and size into that folder, run `python3 games-src/nightrun/make-placeholders.py` (it detects real art and lists it in `media/ready.json`), then commit. Until a file is real art the game draws its own simple vector SHAPE for that item (never the placeholder picture), so everything already works; the real file replaces the shape automatically. Each item below says what the shape is.', '',
       'Style: the same painted look as the existing `spr-*`, `pk-*`, `fx-*`, `boss-*` files. WebP, transparent background for sprites and icons; **light on black** for `fx-*` (drawn additively). Sprites face LEFT (enemies, bosses) or RIGHT (player ships), as in `PAINTED-ART-HANDOFF.md`.', '']
M1 = [e for e in M if not e.get('w34')]
st = {'WIRED': sum(e['status'] == 'WIRED' for e in M1), 'RESERVED': sum(e['status'] == 'RESERVED' for e in M1)}
out += ['**%d files:** %d WIRED (used now), %d RESERVED (for planned features). The wave 34 files are in `ASSETS-NEEDED-2.md`.' % (len(M1), st['WIRED'], st['RESERVED']), '']
for g, es in by.items():
    out += ['## ' + g, '', '| file | size | status | where it is used | what to paint |', '|---|---|---|---|---|']
    for e in es: out.append('| `%s` | %dx%d | %s | %s | %s |' % (e['file'], e['w'], e['h'], e['status'], e['where'], e['notes']))
    out.append('')
out += ['## Sound (no placeholder files yet)', '', 'Short effects, MP3 or OGG, about -16 LUFS, mono is fine, under 1 s unless noted. Save as `games/mainhattan-nightrun/sfx/<name>.mp3`. Today these are made by the built-in synth.', '',
       '| name | length | what it is for |', '|---|---|---|',
       '| `sfx-heartbeat` | 0.4 s | the soft thump on every beat at 1 hull (synth sine today) |', '| `sfx-equip` / `sfx-unequip` | 0.3 s | garage LOAD tab equip and unequip clicks |', '| `sfx-sell` | 0.5 s | coins dropping, selling a perk level |', '| `sfx-buy` | 0.4 s | buying in the garage or the daily shop |',
       '| `sfx-leader-warn` | 0.8 s | a squad leader is about to fire its fan (low brass stab) |', '| `sfx-leader-down` | 1.0 s | leader killed, squad panics |', '| `sfx-medal` | 1.5 s | medal on the stage clear screen |', '| `sfx-chest` | 2.0 s | boss chest reveal (planned feature) |', '',
       '## Music', '', 'Menu song for the garage/shop (2 min loop, calm, same -18 LUFS as the others, with `bpm` and `offsetMs` measured for `tracks.json`). Optional: a short stinger for LEGEND difficulty.', '']
out.append(open(os.path.join(HERE, 'assets-extra.md')).read() if os.path.exists(os.path.join(HERE, 'assets-extra.md')) else '')
open(os.path.join(HERE, 'ASSETS-NEEDED.md'), 'w').write('\n'.join(out))
print('ASSETS-NEEDED.md written')
