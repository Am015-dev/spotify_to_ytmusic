#!/usr/bin/env python3
"""Make a submodel the root of an MPD, so a vehicle placed at an angle in the set's scene converts on the stud grid.
usage: mpdroot.py in.mpd "<submodel name>" out.mpd
Writes a new first FILE that places the submodel once, unrotated, in the colour the scene gave it (its parts in colour 16 inherit it);
all original FILE blocks follow unchanged."""
import sys, re
src, name, out = sys.argv[1:4]
txt = open(src, errors='replace').read().replace('\r\n', '\n')
files = [b for b in re.split(r'(?m)^(?=0 FILE )', txt) if b.startswith('0 FILE')]
fn = lambda b: b.split('\n', 1)[0][7:].strip()
pick = [fn(b) for b in files if fn(b).lower() in (name.lower(), name.lower() + '.ldr')]
assert pick, 'no FILE ' + name
ref = re.search(r'(?m)^1 (\d+) (?:\S+ ){12}%s\s*$' % re.escape(pick[0]), txt)
col = ref.group(1) if ref else '16'
root = '0 FILE root - %s\n0 %s (root wrapper, colour %s from the set scene)\n1 %s 0 0 0 1 0 0 0 1 0 0 0 1 %s\n0 NOFILE\n' % (pick[0], pick[0], col, col, pick[0])
open(out, 'w').write(root + ''.join(files))
print('MPDROOT_OK', out, 'colour', col)
