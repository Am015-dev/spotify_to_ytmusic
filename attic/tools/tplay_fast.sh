#!/usr/bin/env bash
# Fast tPlay: FAST=1 (?fast=1 deterministic frame clock, synthetic touch clock, no CPU throttle), one process per city × mode in parallel.
# Results do not depend on machine speed or CPU contention in fast mode, so parallel runs give the same metrics as serial ones.
# usage: tools/tplay_fast.sh <url of local_dbg.html> <outdir>   env as tPlay (MODE=phone|desk|both, CITIES=fra,ath, MIN=1, SHOTS=0|1)
set -uo pipefail
URL="${1:-http://127.0.0.1:8766/local_dbg.html}"; OUT="${2:-qa_fast}"; mkdir -p "$OUT"
MODE="${MODE:-phone}"; CITIES="${CITIES:-fra,ath}"; HERE="$(cd "$(dirname "$0")" && pwd)"; T0=$(date +%s)
MODES=$([ "$MODE" = both ] && echo "phone desk" || echo "$MODE"); pids=()
for m in $MODES; do for c in ${CITIES//,/ }; do
  ( FAST=1 MODE=$m CITIES=$c node "$HERE/tPlay.js" "$URL" "$OUT/$m-$c" > "$OUT/$m-$c.log" 2>&1 ) & pids+=($!)
done; done
for p in "${pids[@]}"; do wait "$p"; done
grep -h '^PASS\|^FAIL' "$OUT"/*.log | sort | uniq
F=$(grep -h '^FAIL' "$OUT"/*.log | sort -u | wc -l)
echo "TPLAY_FAST $([ "$F" = 0 ] && echo PASS || echo "FAIL $F") · $(( $(date +%s)-T0 )) s · $OUT/*.log"
