#!/usr/bin/env python3
# rdMap.py graph_<city>.json out.png [crop]: top-down road map; main component grey, other components coloured, dead ends red dots, junction signals.
import sys, json
from PIL import Image, ImageDraw, ImageFont
g = json.load(open(sys.argv[1])); out = sys.argv[2]
pts = [p for s in g['segs'] for p in s['p']] + [p for f in g['fill'] for p in f['p']]
xs = [p[0] for p in pts]; zs = [p[1] for p in pts]
x0, x1, z0, z1 = min(xs)-40, max(xs)+40, min(zs)-40, max(zs)+40
S = 1400 / max(x1-x0, z1-z0); W, H = int((x1-x0)*S), int((z1-z0)*S)
im = Image.new('RGB', (W, H+60), (250, 250, 246)); d = ImageDraw.Draw(im)
# north up: z grows north? world z = n (north) -> draw with z flipped; x = -east -> flip x so east is right
P = lambda p: ((x1 - p[0])*S, (z1 - p[1])*S + 60)
COL = [(150,150,150),(230,60,60),(40,120,230),(240,160,0),(150,60,200),(0,170,120),(230,90,180),(120,90,40),(0,160,200),(200,200,0)]
col = lambda c: COL[0] if c == 0 else COL[1 + (c-1) % (len(COL)-1)]
for f in g['fill']:
    d.line([P(p) for p in f['p']], fill=col(f['c']), width=max(1, int(f['w']*S*.8)))
for s in g['segs']:
    if s['cls'] in ('ped', 'hill'): continue
    w = max(1, int(s['w']*S*.8)); c = col(s['c'])
    if s['one'] and s['c'] == 0: c = (110, 110, 170)
    d.line([P(p) for p in s['p']], fill=c, width=w+ (2 if s['w']>=14 else 0))
for j in g['jpts']:
    x, y = P(j[:2])
    if j[3]: d.ellipse([x-2.5, y-2.5, x+2.5, y+2.5], fill=(0, 170, 60))
for x, z, st in g['dead']:
    X, Y = P((x, z)); r = 3.5
    d.ellipse([X-r, Y-r, X+r, Y+r], outline=(220, 0, 0), width=2)
px, py = P((g['player']['x'], g['player']['z'])); d.rectangle([px-5, py-5, px+5, py+5], fill=(0, 0, 0))
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except Exception: F = ImageFont.load_default()
a = g['audit']; t = g['tgraph']
txt = f"{g['city'].upper()}  road comps {a['comps']} (orphan {a['orphanKm']} km of {a['km']})  dead ends {len(g['dead'])}  junctions {g['junc']['n']} (signals {g['junc']['sig']})  traffic SCC main {t['mainSccFrac']*100:.0f}%"
d.text((10, 8), txt, fill=(0, 0, 0), font=F)
d.text((10, 32), "grey = main network · colours = disconnected pieces · red rings = dead ends · green dots = traffic lights · blue-grey = one-way · black square = start", fill=(60, 60, 60), font=F)
im.save(out); print('MAP_OK', out, W, H)
