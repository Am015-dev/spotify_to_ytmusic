#!/bin/bash
# tGo.sh <url> <outdir> : Frankfurt and Athens GO runs in parallel (TAG=… SMOKE=1 QUIET=1 pass through). Prints FAIL lines + one merged summary line + wall time.
U=$1; O=${2:-qa_go}; mkdir -p "$O"; T0=$(date +%s)
CITY=fra QUIET=1 node tools/tChkGo.js "$U" "$O/fra" > "$O/fra.log" 2>&1 &
CITY=ath QUIET=1 node tools/tChkGo.js "$U" "$O/ath" > "$O/ath.log" 2>&1 &
wait
cat "$O/fra.log" "$O/ath.log" | grep -E "^(FAIL|SPAWN-ONLY|PAGE)" | grep -v "^SPAWN-ONLY" | cut -c1-220
node -e "const f=(c)=>{try{return JSON.parse(require('fs').readFileSync('$O/'+c+'.log','utf8').trim().split('\n').pop())}catch(e){return{pass:0,total:0,fail:['no summary '+c],errors:9}}};const a=f('fra'),b=f('ath');console.log(JSON.stringify({pass:a.pass+b.pass,total:a.total+b.total,spawnOnly_or_fail:[...a.fail,...b.fail].length,fail:[...a.fail,...b.fail].filter(x=>!x.startsWith('bx')),errors:a.errors+b.errors,boots:{fra:a.boots&&a.boots.fra,ath:b.boots&&b.boots.ath},wall_s:$(date +%s)-$T0}))"
