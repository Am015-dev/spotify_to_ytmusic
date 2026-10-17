#!/usr/bin/env python3
"""Point checklist items of a What's new entry at scenarios (games/updates.json entry.scn[] / entry.ask[]), atomically.
usage: set-scn.py <game-id> <date> <item-number>=<scn-id> [<item-number>=<scn-id> ...]     (item numbers are 1-based, as listed by --list)
       set-scn.py <game-id> --list                                                            (entries and their items, newest first)"""
import json, pathlib, sys, os, tempfile
F = pathlib.Path(__file__).resolve().parents[2] / 'games' / 'updates.json'
a = sys.argv[1:]
if len(a) < 2: sys.exit(__doc__)
data = json.loads(F.read_text('utf-8')); game = a[0]
if a[1] == '--list':
    for e in data:
        if e['game'] == game:
            print(e['date'], '|', e['title'])
            for i, t in enumerate(e['items']): print('  %d. %s  [%s]' % (i + 1, t[:90], (e.get('scn') or [None] * 99)[i]))
    sys.exit(0)
date = a[1]; e = next((x for x in data if x['game'] == game and x['date'] == date), None)
if not e: sys.exit('no entry %s %s' % (game, date))
n = len(e['items']); e['scn'] = (e.get('scn') or [None] * n)[:n] + [None] * (n - len(e.get('scn') or [])); e['ask'] = (e.get('ask') or [None] * n)[:n] + [None] * (n - len(e.get('ask') or []))
for kv in a[2:]:
    k, v = kv.split('=', 1); e['scn'][int(k) - 1] = v or None
tmp = tempfile.NamedTemporaryFile('w', delete=False, dir=str(F.parent), encoding='utf-8'); tmp.write(json.dumps(data, indent=1, ensure_ascii=False) + '\n'); tmp.close(); os.replace(tmp.name, F)
print('ok', game, date, e['scn'])
