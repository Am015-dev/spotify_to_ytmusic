#!/usr/bin/env python3
"""Add a "What's new" note for the shelf.
usage: add-update.py <game-id> "headline" "item" ["item"...] --check "what to try"
Prepends an entry dated today to games/updates.json (merges into today's entry for that game).
Game ids are the shelf ids (crown, nebula, ..., or 'shelf' for the shelf itself)."""
import argparse, json, datetime, pathlib
F = pathlib.Path(__file__).resolve().parents[2] / 'games' / 'updates.json'
ap = argparse.ArgumentParser()
ap.add_argument('game'); ap.add_argument('title'); ap.add_argument('items', nargs='*')
ap.add_argument('--check', default='')
ap.add_argument('--date', default=datetime.date.today().isoformat())
a = ap.parse_args()
data = json.loads(F.read_text('utf-8')) if F.exists() else []
hit = next((e for e in data if e['date'] == a.date and e['game'] == a.game), None)
if hit:
    hit['title'] = a.title
    hit['items'] = hit['items'] + [i for i in a.items if i not in hit['items']]
    if a.check: hit['check'] = a.check
    data.remove(hit); data.insert(0, hit)
else:
    data.insert(0, dict(date=a.date, game=a.game, title=a.title, items=a.items, check=a.check))
data.sort(key=lambda e: e['date'], reverse=True)  # stable: newest day first, newest entry first within a day
F.write_text(json.dumps(data, indent=1, ensure_ascii=False) + '\n', 'utf-8')
print('updates.json:', len(data), 'entries')
