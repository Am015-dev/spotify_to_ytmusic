#!/usr/bin/env python3
"""Make a skin stylesheet size-neutral: painted plates may only be drawn by border-image (border-width 0), never change a box.
  python3 games-src/scripts/skin-size-fix.py games-src/<game>/skin.css [--dry]
In every rule that paints a plate (has border-image / border-width), it:
  * turns `border: Npx solid transparent` into `border-style:solid;border-color:transparent` (the element keeps its OWN border width;
    border-image-width sets the plate size and paints even when that width is 0),
  * drops border-width, padding*, min-width, min-height, margin*, box-sizing, font-weight/size, line-height, white-space, flex
(each can change the box; the element keeps the unskinned ones).
Then check with GXSK.audit() through `node games-src/scripts/phone-check.js` (fails when a box moves more than 2 px)."""
import re, sys
f = [a for a in sys.argv[1:] if not a.startswith('--')][0]; dry = '--dry' in sys.argv
css = open(f, encoding='utf-8').read()
DROP = re.compile(r'(?:^|;)\s*(border-width|padding(?:-[a-z]+)?|min-width|min-height|margin(?:-[a-z]+)?|box-sizing|font-weight|font-size|line-height|white-space|justify-content|flex)\s*:[^;{}]*', re.I)
n = 0
def fix(m):
    global n
    sel, body = m.group(1), m.group(2)
    if 'border-image' not in body and not re.search(r'(^|;)\s*border-width\s*:', body): return m.group(0)
    if re.search(r'(^|[ ,>])(html\.dk-par|\.gx-dock-body)', sel) and False: return m.group(0)
    new = re.sub(r'(^|;)\s*border:\s*[0-9.]+(?:px)?\s+solid\s+transparent', r'\1border-style:solid;border-color:transparent', body)
    new = DROP.sub('', new)
    new = re.sub(r'^;+', '', new)
    if new != body: n += 1
    return sel + '{' + new + '}'
out = re.sub(r'((?:^|(?<=\}))\s*[^{}@]+?)\{([^{}]*)\}', lambda m: fix(m), css)
print(f'{f}: {n} plate rules made size-neutral')
if not dry: open(f, 'w', encoding='utf-8').write(out)
