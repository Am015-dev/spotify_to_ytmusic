#!/usr/bin/env python3
"""Add a "What's new" note for the shelf.
usage: add-update.py <game-id> "headline" "item" ["item"...] --check "what to try" [--scn ID[@N]]... [--ask "line"[@N]]...
--scn gives an item a test scenario id (the game opens with ?scn=ID: games-src/shell/gx-scenario.js). Ids are assigned to the new items in the
order given, or to item N (1-based among the items of this call) with ID@N. --ask is the one-line "try this" shown beside "▶ Try this" until the
page itself reports the scenario's ask line (same ordering / @N rule). Stored as parallel arrays entry.scn[] / entry.ask[] (null = no scenario).
Prepends an entry dated today to games/updates.json (merges into today's entry for that game).
Game ids are the shelf ids (crown, nebula, ..., or 'shelf' for the shelf itself)."""
import argparse, json, datetime, pathlib
F = pathlib.Path(__file__).resolve().parents[2] / 'games' / 'updates.json'
ap = argparse.ArgumentParser()
ap.add_argument('game'); ap.add_argument('title'); ap.add_argument('items', nargs='*')
ap.add_argument('--check', default='')
ap.add_argument('--scn', action='append', default=[])
ap.add_argument('--ask', action='append', default=[])
ap.add_argument('--date', default=datetime.date.today().isoformat())
a = ap.parse_args()
data = json.loads(F.read_text('utf-8')) if F.exists() else []
def spread(vals, n):
    """values for the n items of this call: 'X@3' -> item 3, otherwise next free slot"""
    out = [None] * n; free = iter(range(n))
    for v in vals:
        if '@' in v and v.rsplit('@', 1)[1].isdigit(): v, k = v.rsplit('@', 1); out[int(k) - 1] = v
        else:
            for k in free:
                if out[k] is None: out[k] = v; break
    return out
hit = next((e for e in data if e['date'] == a.date and e['game'] == a.game), None)
if hit:
    hit['title'] = a.title
    new = [i for i in a.items if i not in hit['items']]
    scn, ask = spread(a.scn, len(a.items)), spread(a.ask, len(a.items))
    n0 = len(hit['items']); hit['items'] = hit['items'] + new
    if any(scn) or hit.get('scn'):
        hit['scn'] = (hit.get('scn') or [None] * n0)[:n0] + [scn[a.items.index(i)] for i in new]
        hit['ask'] = (hit.get('ask') or [None] * n0)[:n0] + [ask[a.items.index(i)] for i in new]
    if a.check: hit['check'] = a.check
    data.remove(hit); data.insert(0, hit)
else:
    e = dict(date=a.date, game=a.game, title=a.title, items=a.items, check=a.check)
    if a.scn: e['scn'] = spread(a.scn, len(a.items)); e['ask'] = spread(a.ask, len(a.items))
    data.insert(0, e)
data.sort(key=lambda e: e['date'], reverse=True)  # stable: newest day first, newest entry first within a day
F.write_text(json.dumps(data, indent=1, ensure_ascii=False) + '\n', 'utf-8')
print('updates.json:', len(data), 'entries')
