#!/bin/bash
# at.sh <name> <x> <z> <h> [port]: warp, drive 1.5 s, chase shot
P=${5:-9333}; c(){ curl -s -m 600 "localhost:$P/$1" "${@:2}"; }
c eval --data "(()=>{const M=__mho;M.warp($2,$3,$4,true);const R=M.RO;R.x=$2;R.z=$3;R.h=$4;R.v=0;__tick(30);if(window.__A6)__A6.cam(null);return 1})()" >/dev/null
c hold?k=gas\&on=1; c tick?n=90 >/dev/null; c hold?k=gas\&on=0; c tick?n=20 >/dev/null; c cshot?n=$1; echo
