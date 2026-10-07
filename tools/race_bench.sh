#!/usr/bin/env bash
# race_bench.sh <label> [runs] : tRace on grand, hafen, akro (Athens) × runs on the current local build → qa_race/<label>/bench.txt
cd "$(dirname "$0")/.."; L=$1; N=${2:-2}; mkdir -p qa_race/$L; : > qa_race/$L/bench.txt
for t in fra:grand fra:hafen ath:akro; do for i in $(seq 1 $N); do
  SH=$([ $i = 1 ] && echo 1 || echo 0); CITY=${t%%:*} TRACK=${t##*:} SHOTS=$SH TAG=${t##*:}_ node tools/tRace.js http://127.0.0.1:8766/local_dbg.html qa_race/$L | grep RACE_RESULT >> qa_race/$L/bench.txt
done; done
python3 - qa_race/$L/bench.txt <<'P'
import json,sys,collections
R=collections.defaultdict(list)
for l in open(sys.argv[1]):
  d=json.loads(l.split(' ',1)[1]);R[d['track'].split('|')[0]].append(d)
for k,v in R.items():
  a=lambda f:round(sum(f(x) for x in v)/len(v),2)
  print(k,'W',v[0]['track'].split('W=')[1],'raceSec',a(lambda x:x['raceSec']),'avgKmh',a(lambda x:x['avgKmh']),'top',a(lambda x:x['topKmh']),'wall/min',a(lambda x:x['wallPerMin']),'transf',a(lambda x:x['transforms']),'items',a(lambda x:x['itemsUsed']),'ms',a(lambda x:(x['render'] or {'ms':0})['ms']),'calls',a(lambda x:(x['render'] or {'calls':0})['calls']),'place',[x['place'] for x in v],'routes',[x['routes'] for x in v],'err',sum(len(x['errors']) for x in v))
P
