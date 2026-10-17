#!/bin/bash
# run.sh <ver> <tag> : fra+ath desktop, then fra+ath lowmem (2 at a time), 60 s roam + race
cd /home/user/spotify_to_ytmusic; V=$1; T=$2
for LM in 0 1; do
 for C in fra ath; do CITY=$C LOWMEM=$LM SECS=45 RSECS=45 node tools/perf1/tFrame.js out $V > qa_pf1/${T}_${C}_lm$LM.log 2>&1 & done; wait
done; echo RUN_DONE $T
