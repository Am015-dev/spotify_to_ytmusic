#!/bin/bash
# every player count x every expansion combination, normal AI; output in runs/
cd "$(dirname "$0")"
N=${N:-30}
for np in 2 3 4 5 6; do
 for ex in base river ic tb river,ic river,tb ic,tb river,ic,tb; do
  if [ $np = 6 ] && [[ $ex != *ic* ]]; then continue; fi
  echo "node gauntlet.js $N $np $ex > runs/g_${np}_${ex//,/+}.txt 2>&1"
 done
done | xargs -P ${P:-4} -I{} bash -c "{}"
cat runs/g_*.txt > gall.txt
