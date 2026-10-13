#!/usr/bin/env bash
# serial: turn/brake strips, boost re-shoot, Athens A/B (live v87s vs b2k18c), water hop
cd /home/user/spotify_to_ytmusic
U=http://127.0.0.1:8766/b2k18c_dbg.html?fast=1
SC=../t18/strips.js node t16/b2k.js "$U" qa18/s_strip fra > qa18/s_strip.log 2>&1; echo strip $?
node t16/b2k.js "$U" qa18/s_fra2 fra > qa18/s_fra2.log 2>&1; echo fra2 $?
NEW=b2k18c qa18/ab18.sh qa18/ab2 4 "ath" "1 2 3"
SC=./scen_water.js node t16/b2k.js "$U" qa18/s_water2 fra > qa18/s_water2.log 2>&1; echo water $?
