#!/usr/bin/env bash
# seeded A/B: live (base16_dbg) vs new (b2k16_dbg), pairs run together so both see the same CPU load. usage: t16/ab.sh <out> [MIN]
OUT=${1:-qa16/ab};M=${2:-3};mkdir -p $OUT
for s in 1 2 3; do for c in fra ath; do
 for v in base16 b2k16; do (SEED=$s FAST=1 MODE=phone CITIES=$c MIN=$M SHOTS=0 node t16/tPlayDbg.js "http://127.0.0.1:8766/${v}_dbg.html?fast=1" $OUT/$v-$c-$s > $OUT/$v-$c-$s.log 2>&1) & done
done; wait; done
python3 - "$OUT" <<'PY'
import json,sys,glob,os
O=sys.argv[1];rows={}
def f(o):
  if isinstance(o,dict):
    if 'wallHits' in o: return o
    for v in o.values():
      r=f(v)
      if r: return r
  elif isinstance(o,list):
    for v in o:
      r=f(v)
      if r: return r
for p in sorted(glob.glob(O+'/*/tPlay.json')):
  n=os.path.basename(os.path.dirname(p));v,c,s=n.split('-');o=f(json.load(open(p)))
  rows.setdefault((v,c),[]).append((o['wallHits'],o['min'],o['stuckPct'],o['avgKmh']))
for (v,c),L in sorted(rows.items()):
  w=sum(x[0] for x in L);m=sum(x[1] for x in L)
  print(v,c,'runs',len(L),'walls/min %.2f'%(w/m),'stuck%% %.1f'%(sum(x[2] for x in L)/len(L)),'km/h %.1f'%(sum(x[3] for x in L)/len(L)),[x[0] for x in L])
PY
