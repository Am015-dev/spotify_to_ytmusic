# Compose contact sheets from sheets-capture.js output.
# Usage: python3 games-src/scripts/contact-sheet-compose.py <raw_dir> <out_dir>
# Writes <out_dir>/<slug>-phone.jpg, <slug>-pc.jpg, <slug>-flags.txt and <out_dir>/flags.json (flag counts per game).
import json, os, sys
from PIL import Image, ImageStat, ImageDraw

raw, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
COLS = {'phone': 3, 'pc': 2}
THUMB = {'phone': (201, 437), 'pc': (640, 400)}
LABEL_H = 22
summary = {}

def flags_for(cell, img):
    f = []
    if cell['errors']: f.append('pageerror: ' + cell['errors'][0][:80])
    if cell['loadError']: f.append('load: ' + cell['loadError'][:80])
    if img is None: f.append('missing-shot')
    elif ImageStat.Stat(img.convert('L')).stddev[0] < 4: f.append('blank')
    return f

for slug in sorted(os.listdir(raw)):
    d = os.path.join(raw, slug)
    if not os.path.isdir(d): continue
    lines, count = [], 0
    for size in ('phone', 'pc'):
        jp = os.path.join(d, size + '.json')
        if not os.path.exists(jp): lines.append(f'{size}: no capture'); count += 1; continue
        meta = json.load(open(jp))
        cells = meta['cells']
        tw, th = THUMB[size]; cols = COLS[size]
        rows = (len(cells) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * tw + (cols + 1) * 6, rows * (th + LABEL_H) + (rows + 1) * 6), (18, 18, 22))
        dr = ImageDraw.Draw(sheet)
        for i, cell in enumerate(cells):
            p = os.path.join(d, cell['file'])
            img = Image.open(p).convert('RGB') if os.path.exists(p) else None
            fl = flags_for(cell, img)
            x = 6 + (i % cols) * (tw + 6); y = 6 + (i // cols) * (th + LABEL_H + 6)
            if img: sheet.paste(img.resize((tw, th), Image.LANCZOS), (x, y + LABEL_H))
            dr.text((x + 2, y + 4), (('FLAG ' if fl else '') + cell['name'])[:40], fill=(255, 90, 90) if fl else (230, 220, 190))
            for m in fl:
                lines.append(f'{size} {cell["name"]}: {m}'); count += 1
        sheet.save(os.path.join(out, f'{slug}-{size}.jpg'), 'JPEG', quality=75, optimize=True)
    open(os.path.join(out, f'{slug}-flags.txt'), 'w').write('\n'.join(lines) + ('\n' if lines else ''))
    summary[slug] = count
json.dump(summary, open(os.path.join(out, 'flags.json'), 'w'), indent=1)
print(json.dumps(summary, indent=1))

# index.html: one card per game, sorted by flag count (desc).
import datetime, html, subprocess
commit = sys.argv[3] if len(sys.argv) > 3 else 'unknown'
when = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
cards = []
for slug, n in sorted(summary.items(), key=lambda kv: (-kv[1], kv[0])):
    name = slug.replace('-', ' ').title()
    fl = os.path.join(out, f'{slug}-flags.txt')
    flag_lines = open(fl).read().strip().splitlines() if os.path.exists(fl) else []
    flag_html = ''.join(f'<li>{html.escape(x)}</li>' for x in flag_lines)
    badge = f'<span class="badge{" bad" if n else ""}">{n} flag{"s" if n != 1 else ""}</span>'
    cards.append(f'''<section class="card"><header><h2>{html.escape(name)}</h2>{badge}
<a class="play" href="../{slug}/" target="_blank" rel="noopener">Play live</a></header>
<div class="shots"><a href="{slug}-phone.jpg" target="_blank" rel="noopener"><img loading="lazy" src="{slug}-phone.jpg" alt="{html.escape(name)} phone sheet"><span>Phone</span></a>
<a href="{slug}-pc.jpg" target="_blank" rel="noopener"><img loading="lazy" src="{slug}-pc.jpg" alt="{html.escape(name)} PC sheet"><span>PC</span></a></div>
{('<details><summary>Flags</summary><ul>' + flag_html + '</ul></details>') if flag_lines else ''}</section>''')
page = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contact sheets</title>
<style>
:root{{--bg:#14141a;--card:#1f1f28;--text:#ece6d4;--muted:#aaa48f;--brass:#d9b45c;--bad:#ff6b6b;--ok:#6fbf73}}
@media (prefers-color-scheme: light){{:root:not([data-theme="dark"]){{--bg:#f4f1ea;--card:#fff;--text:#1d1b16;--muted:#5c574b;--brass:#8a6410}}}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--text);font:16px/1.45 system-ui,sans-serif}}
main{{max-width:1100px;margin:0 auto;padding:16px}}
h1{{font-size:1.5rem;margin:0 0 4px}}
.meta{{color:var(--muted);font-size:14px;margin:0 0 16px}}
.card{{background:var(--card);border-radius:10px;padding:12px 14px;margin:0 0 14px}}
.card header{{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}}
.card h2{{font-size:1.15rem;margin:0;flex:1 1 auto}}
.badge{{font-size:14px;border-radius:999px;padding:2px 10px;background:#2c3a2d;color:var(--ok)}}
.badge.bad{{background:#432525;color:var(--bad)}}
.play{{color:var(--brass);font-size:14px;min-height:36px;display:inline-flex;align-items:center}}
.shots{{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;overflow-x:auto}}
.shots a{{color:var(--text);text-decoration:none;display:flex;flex-direction:column;align-items:flex-start;gap:4px;max-width:100%}}
.shots img{{max-height:420px;max-width:100%;border-radius:6px;border:1px solid #0004}}
.shots span{{font-size:14px;color:var(--muted)}}
details{{margin-top:8px;font-size:14px;color:var(--muted)}}
details summary{{cursor:pointer;min-height:36px;display:flex;align-items:center}}
details ul{{margin:4px 0 0;padding-left:18px;color:var(--bad)}}
body>footer{{color:var(--muted);font-size:14px}}
</style></head>
<body><main>
<h1>Contact sheets</h1>
<p class="meta">Generated {when} · repo commit {html.escape(commit)} · {len(summary)} games · sorted by flag count, most first. Tap a sheet to open it full size.</p>
{chr(10).join(cards)}
<footer><a href="../index.html" style="color:var(--brass)">Back to the shelf</a></footer>
</main></body></html>
'''
open(os.path.join(out, 'index.html'), 'w').write(page)
print('index.html written:', len(summary), 'games')
