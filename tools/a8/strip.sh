#!/bin/bash
# usage: eval tools/a8/zf.js + tools/a8/ap.js (+ tools/a6_eval.js) first. Columns: frame x z km/h offPath roadMaskPx grassOnRoad24 grassOnRoad16
# strip2.sh <port> <x> <z> <h> <preroll chunks of 6 ticks> <nframes> <ticks/frame> [shotprefix] — autopilot on __AP
P=$1; c(){ curl -s -m 900 "localhost:$P/$1" "${@:2}"; }
c eval --data "(()=>{const M=__mho;M.warp($2,$3,$4,true);const R=M.RO;R.x=$2;R.z=$3;R.h=$4;R.v=0;__tick(30);if(window.__A6)__A6.cam(null);return 1})()" >/dev/null
c hold?k=gas\&on=1 >/dev/null
for k in $(seq 1 $5); do c eval --data "(()=>{__APstep();__tick(6);return 1})()" >/dev/null; done
for i in $(seq -w 1 $6); do c eval --data "(()=>{for(let k=0;k<$7;k++){__APstep();__tick(1)}return 1})()" >/dev/null
 z=$(c eval --data "(()=>{const R=__mho.RO;const off=__APstep();const a=__ZF(0,0),b=__ZF(0,1);return [Math.round(R.x),Math.round(R.z),Math.round(Math.abs(R.v)*3.6),off.toFixed(1),a.mask,a.lost,b.lost].join(' ')})()" | tr -d '"')
 echo "$i $z"; [ -n "$8" ] && c cshot?n=$8_$i >/dev/null; done
c hold?k=gas\&on=0 >/dev/null
