#!/bin/bash
# one lap per built-in track, parallel pages, FAIL lines only.  SLOPPY=3 tools/bx/tPar.sh [ids...]
cd "$(dirname "$0")/../.."; ids=${@:-bx-t-cliff bx-t-city bx-t-canyon}
for t in $ids; do SECS=${SECS:-100} timeout 600 node tools/bx/tTracks.js $t > qa_bx/par_$t.txt 2>&1 & sleep 15; done; wait
for t in $ids; do grep -h "^bx-t.*{" qa_bx/par_$t.txt | python3 -c "
import sys,json
for l in sys.stdin:
  n,j=l.split(' ',1);d=json.loads(j);f=[x for x in d['msg'].replace(' | ',', ').split(', ') if '✘' in x]
  print(n,'PASS' if d['ok'] else 'FAIL',('' if d['ok'] else d['msg'].split(' | ')[0]),f)" || echo "$t ERROR $(grep -m1 Error qa_bx/par_$t.txt)"; done
