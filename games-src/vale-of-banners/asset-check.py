#!/usr/bin/env python3
"""Computes required ids from src/data.js (via node) and checks assets.json and the flow prompt files.  python3 games-src/vale-of-banners/asset-check.py [--md]"""
import json, subprocess, pathlib, sys, glob
D = pathlib.Path(__file__).resolve().parent
js = ("var V=require('%s/src/data.js');var r=[];"
 "r.push(['Keep tile',V.tileStem({t:'castle'})],['Mine tile',V.tileStem({t:'mine'})],['Barge tile',V.tileStem({t:'ship'})],['Tile back','tile-back']);"
 "V.BLDKEYS.forEach(function(b){r.push(['Building: '+V.BLD[b].name,V.tileStem({t:'bld',k:b})])});"
 "V.KNOW.forEach(function(k){r.push(['Lore: '+k.name,V.tileStem({t:'know',k:k.id})])});"
 "Object.keys(V.ANIMALS).forEach(function(a){[2,3,4].forEach(function(n){r.push(['Pasture: '+n+' '+V.ANIMALS[a],V.tileStem({t:'pas',k:a,n:n})])})});"
 "V.GOODS.forEach(function(g,i){if(g)r.push(['Goods: '+g,'goods-'+i])});"
 "['wren','odo','cass','hask','marla','ivo'].forEach(function(c){r.push(['Cast: '+V.CAST[c].name,'portrait-'+c])});"
 "['cass','hask','ivo'].forEach(function(c){r.push(['Boss: '+V.CAST[c].name,'boss-'+c])});"
 "V.SEATNAME.forEach(function(n,i){r.push(['Seat banner: '+n,'token-banner-'+i])});"
 "console.log(JSON.stringify(r))") % D
req = json.loads(subprocess.check_output(['node', '-e', js]))
req += [[a, b] for a, b in [
 ('Estate mat', 'board-estate'), ('Market board', 'board-market'), ('Title background', 'bg-title'), ('Table background', 'bg-table'), ('Story map', 'bg-map'),
 ('Worker token', 'token-worker'), ('Silver token', 'token-silver'), ('Points token', 'token-points'), ('White die', 'die-white'),
 ('Icon: workers', 'icon-workers'), ('Icon: silver', 'icon-silver'), ('Icon: points', 'icon-points'), ('Icon: storage', 'icon-storage'),
 ('Icon: back lane', 'icon-backlane'), ('Icon: season', 'icon-season'), ('Icon: banner track', 'icon-track'),
 ('Tile frame', 'ui-tile-frame'), ('Win screen', 'ui-result-win'), ('Lose screen', 'ui-result-lose'), ('Story scroll', 'ui-scroll'),
 ('FX region complete', 'fx-region-complete'), ('FX chain', 'fx-chain'), ('FX coin', 'fx-coin')]]
have = {i['stem'] for i in json.loads((D / 'assets.json').read_text())['items']}
fl = set()
for f in glob.glob(str(D.parent / 'next-wave/flow-2d/vale-of-banners/*.json')): fl |= set(json.load(open(f))['cards'])
rows = [(n, s, s in have, s in fl) for n, s in req]
gaps = [r for r in rows if not (r[2] and r[3])]
if '--md' in sys.argv:
    print('| id | stem | in assets.json | prompted in flow file |\n|---|---|---|---|')
    for n, s, a, f in rows: print('| %s | %s | %s | %s |' % (n, s, 'yes' if a else 'no', 'yes' if f else 'no'))
extra = sorted(have - {s for _, s in req})
print('\nrequired: %d\nprompted: %d\ngaps: %d\nextra stems in assets.json not in rules: %s' % (len(rows), sum(1 for r in rows if r[3]), len(gaps), extra or 'none'))
