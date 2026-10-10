#!/usr/bin/env python3
"""v89z lazy models: src/MODELS data modules -> out/<ver>/models.js (small boot index) + out/<ver>/models/<model>.js (one chunk per LD model).
Usage: tools/ld/mkmodels.py <outdir>   (run by tools/build.sh)

Each data module is: 2 comment lines, `Object.assign(LD_MESH,{json});`, `Object.assign(LD_MODELS,{json});`, then light code
(GB_PC loop, GAR_SETS.push preset / LDW_P.push placement). models.js keeps only the light code (presets + placements, run at boot by
98ld_run.js; the GB_PC loop is dropped because LDW_reg registers each chunk's meshes when it arrives) plus the index:
  __LDX.c  chunk id (= LD model id) -> {f: url?hash, n: bytes}
  __LDX.k  mesh key -> smallest chunk that carries it (saved bricks name mesh keys)
  __LDX.s  ride preset id -> model ids (boot preload of the equipped ride)
A chunk = one model + every mesh it uses (canonical copy = the last module that defines the key, the old global-load winner), so it is
self-contained. models.js document.write()s the chunks the saved garage needs (equipped ride, its saved bricks) before the game runs."""
import json, os, re, sys, hashlib

out = sys.argv[1]
src = os.path.join(os.path.dirname(__file__), '..', '..', 'src')
mods = open(os.path.join(src, 'MODELS')).read().split()
MESH, MODEL, own, light, sets = {}, {}, {}, [], {}
for f in mods:
    L = open(os.path.join(src, f), encoding='utf8').read().split('\n')
    a, b = 'Object.assign(LD_MESH,', 'Object.assign(LD_MODELS,'
    assert L[2].startswith(a) and L[3].startswith(b), f + ': lines 3/4 must be the LD_MESH / LD_MODELS assigns'
    m = json.loads(L[2][len(a):-2]); d = json.loads(L[3][len(b):-2])
    MESH.update(m)                                   # last module wins (as with the old global load)
    for k in d: MODEL[k] = (f, d[k])
    own[f] = (list(m), list(d))
    rest = [l for l in L[4:] if not (l.startswith('for(const k of [') and 'GB_PC[k]' in l)]
    code = '\n'.join(L[:2] + rest)
    light.append((f, code))
    for blk in re.split(r'GAR_SETS\.push\(', code)[1:]:
        sid = re.match(r"\{id:'([\w-]+)'", blk)
        if sid: sets[sid.group(1)] = sorted(set(re.findall(r"LD_br\('([\w-]+)'\)", blk.split('GAR_SETS.push(')[0])))
# presets in 98ld_import.js (rally, speedboat, turbo, power boat)
for l in open(os.path.join(src, '98ld_import.js'), encoding='utf8').read().split('\n'):
    for blk in l.split('GAR_SETS.push(')[1:]:
        sid = re.match(r"\{id:'([\w-]+)'", blk)
        if not sid: continue
        ids = set(re.findall(r"LD_br\('([\w-]+)'\)", blk)) | {'boat' for _ in re.findall(r'\bLD_boat\b', blk)} | {'pboat' for _ in re.findall(r'\bLD_pboat\b', blk)}
        if ids: sets[sid.group(1)] = sorted(ids)
base = lambda t: t.split('@')[0]
chunks = {}
for k, (f, d) in MODEL.items():
    use = {base(b[0]) for b in d['B']} & set(MESH)
    if own[f][1][0] == k: use |= set(own[f][0])     # meshes no model uses ride with the module's first model
    chunks[k] = (sorted(use), d)
os.makedirs(os.path.join(out, 'models'), exist_ok=True)
for old in os.listdir(os.path.join(out, 'models')): os.remove(os.path.join(out, 'models', old))
C, K = {}, {}
for k, (use, d) in chunks.items():
    s = ('// models/%s.js: one LDraw model for overdrive.html (tools/ld/mkmodels.py). CCAL 2.0, authors in models.js.\n__LDC(%s,%s,%s);\n'
         % (k, json.dumps(k), json.dumps({u: MESH[u] for u in use}, separators=(',', ':')), json.dumps({k: d}, separators=(',', ':'))))
    open(os.path.join(out, 'models', k + '.js'), 'w', encoding='utf8').write(s)
    C[k] = {'f': 'models/%s.js?%s' % (k, hashlib.sha1(s.encode()).hexdigest()[:8]), 'n': len(s)}
    for u in use:
        if u not in K or C[K[u]]['n'] > len(s): K[u] = k
X = json.dumps({'c': C, 'k': dict(sorted(K.items())), 's': dict(sorted(sets.items()))}, separators=(',', ':'))
boot = r"""// boot preload: the chunks the saved garage needs (equipped street/off-road/water ride + its saved bricks, the open build), parser-blocking so the player's ride builds at boot
(function(){var X=window.__LDX,need={};if(document.readyState!=='loading')return;function add(c){if(c&&X.c[c])need[c]=1}
 try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(!/^mho_(gar|build)/.test(k))continue;var v=localStorage.getItem(k)||'',t=v;
  if(/^mho_gar/.test(k)){var o=JSON.parse(v)||{};[o.sel,o.off,o.boat].forEach(function(s){(X.s[s]||[]).forEach(add)});t=JSON.stringify(o.br&&o.br[o.sel]||0)}
  (t.match(/"ld[0-9a-z_]+/g)||[]).forEach(function(m){add(X.k[m.slice(1)])})}}catch(e){}
 for(var c in need)document.write('<script src="'+X.c[c].f+'"><\/script>')})();
"""
with open(os.path.join(out, 'models.js'), 'w', encoding='utf8') as o:
    o.write('// models.js: LDraw model INDEX for overdrive.html (tools/ld/mkmodels.py from src/MODELS; run by 98ld_run.js). Model data loads per model from models/<id>.js.\n')
    o.write('// LDraw files: CCAL 2.0, authors in each block.\n')
    o.write('window.__LDX=' + X + ';window.__LDD=window.__LDD||{};\n')
    o.write('window.__LDC=function(id,M,D){window.__LDD[id]=[M,D];if(window.__LDH)window.__LDH(id)};\n')
    for f, code in light:
        o.write('(window.__LDQ=window.__LDQ||[]).push(function(LD_MESH,LD_MODELS,GB_PC,G13_ID,GAR_SETS,GAR_set,LD_br,LDW_P,LDW_reg){// %s\n%s\n});\n' % (f, code))
    o.write(boot)
tot = sum(c['n'] for c in C.values())
print('MODELS_OK index %d B, %d chunks %d B (max %s %d B), %d meshes, %d presets' % (os.path.getsize(os.path.join(out, 'models.js')), len(C), tot,
      max(C, key=lambda k: C[k]['n']), max(c['n'] for c in C.values()), len(K), len(sets)))
