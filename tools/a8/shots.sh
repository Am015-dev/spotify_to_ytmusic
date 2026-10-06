#!/bin/bash
# shots.sh <prefix> [port]  — open road, low side (player), high chase, traffic side, chase; tyre gaps
P=${2:-9333}; c(){ curl -s -m 600 "localhost:$P/$1" "${@:2}"; }
c eval --data-binary @/home/user/spotify_to_ytmusic/tools/a6_eval.js >/dev/null
c eval --data '__A6.road()'; echo
c tick?n=40 >/dev/null; c hold?k=gas\&on=1; c tick?n=60 >/dev/null; c hold?k=gas\&on=0; c tick?n=120 >/dev/null
c eval --data '__A6.cam("player")' >/dev/null; c cshot?n=$1_side; echo
c eval --data 'JSON.stringify(__A6.tyres())'; echo
c eval --data '__A6.cam("high")' >/dev/null; c cshot?n=$1_high; echo
c eval --data '__A6.cam("traffic")' >/dev/null; c cshot?n=$1_traffic; echo
c eval --data '__A6.cam(null)' >/dev/null; c cshot?n=$1_chase; echo
