#!/usr/bin/env bash
# SERIAL seeded A/B: live v87s (base18_dbg) vs new (b2k18_dbg). usage: qa18/ab18.sh <out> [MIN] [cities] [seeds]
cd /home/user/spotify_to_ytmusic
OUT=${1:-qa18/ab};M=${2:-4};CS=${3:-"ath fra"};SS=${4:-"1 2 3"};mkdir -p $OUT
for c in $CS; do for s in $SS; do for v in base18 ${NEW:-b2k18}; do
 SEED=$s FAST=1 MODE=phone CITIES=$c MIN=$M SHOTS=0 node t16/tPlayDbg.js "http://127.0.0.1:8766/${v}_dbg.html?fast=1" $OUT/$v-$c-$s > $OUT/$v-$c-$s.log 2>&1; echo "$v $c $s $?"
done; done; done
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
  print(v,c,'runs',len(L),'walls/min %.2f'%(w/m),'stuck%% %.1f'%(sum(x[2] for x in L)/len(L)),'km/h %.1f'%(sum(x[3] for x in L)/len(L)),'walls',[x[0] for x in L],'stuck',[x[2] for x in L])
PY
