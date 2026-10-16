#!/usr/bin/env python3
"""Regenerates the ship-art entries of assets-manifest.json from the game source (run again after merging new weapons or ships):
  wpmount-<weaponId>.webp   256x128  one attachment per weapon in WPD (parts/g.js), drawn on the ship at slot 1 or 2
  ship-<shipId>-armed.webp  512x256  optional full composite per ship (both slots filled), replaces the mounts in the previews when present
Never touches other entries (the wp-*.webp icons and everything else stay). Then run make-placeholders.py and games-src/scripts/next-wave.py."""
import json, os, re, glob
HERE = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(HERE, 'parts'); MEDIA = os.path.normpath(os.path.join(HERE, '..', '..', 'games', 'mainhattan-nightrun', 'media'))
g = open(os.path.join(P, 'g.js'), encoding='utf8').read()
blk = g[g.index('const WPD={'):]; blk = blk[:blk.index('};') + 2]
weapons = re.findall(r"(\w+):\{n:'([^']+)',s:'[^']*',c:'(#[0-9a-fA-F]{3,6})'", blk)
src = ''.join(open(os.path.join(P, f), encoding='utf8').read() for f in ('garage.js', 'shapes.js', 'up2.js'))
real = {os.path.basename(f)[5:-5] for f in glob.glob(os.path.join(MEDIA, 'ship-*.webp')) if not f.endswith('-armed.webp')}
ships = [(i, n) for i, n in re.findall(r"id:'(\w+)',\s*n:'([^']+)'", src) if i in real]
seen = set(); ships = [s for s in ships if not (s[0] in seen or seen.add(s[0]))]
STYLE = 'painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background'
def mount(i, n, c):
    return dict(file='wpmount-%s.webp' % i, w=256, h=128, group='Ship weapon mounts', status='WIRED', kind='icon',
        where='On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when %s is equipped (a coloured circle/triangle until this exists)' % n.title(),
        notes='%s mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour %s. 256x128, transparent. Paint at 1024x512 or larger, we convert.' % (n.title(), c),
        prompt='a small spaceship weapon attachment for %s, side view, muzzle pointing right, compact single part, accent glow %s, centred, %s' % (n.lower(), c, STYLE))
def armed(i, n):
    return dict(file='ship-%s-armed.webp' % i, w=512, h=256, group='Ship weapon mounts', status='WIRED', kind='icon',
        where='OPTIONAL: the %s ship with both weapon slots filled; replaces the mounts in the WEAPONS sheet and Garage preview when present' % n,
        notes='%s ship, same pose and painted style as ship-%s.webp, with four small neutral guns fitted (two on top, two below), nose pointing RIGHT. 512x256, transparent. Paint at 2048x1024 or larger, we convert.' % (n, i),
        prompt='the %s spaceship seen from the side, nose pointing right, fitted with four small neutral guns, two above and two below the hull, %s' % (n, STYLE))
M = json.load(open(os.path.join(HERE, 'assets-manifest.json'), encoding='utf8'))
new = [mount(i, n, c) for i, n, c in weapons] + [armed(i, n) for i, n in ships]
byf = {e['file']: e for e in new}
out = [byf.pop(e['file'], e) for e in M]          # refresh existing entries in place
out += [e for e in new if e['file'] in byf]
json.dump(out, open(os.path.join(HERE, 'assets-manifest.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False); open(os.path.join(HERE, 'assets-manifest.json'), 'a').write('\n')
print('weapon mounts:', ','.join(i for i, _, _ in weapons)); print('armed composites:', ','.join(i for i, _ in ships)); print('manifest entries:', len(out))
