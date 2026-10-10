#!/usr/bin/env bash
cd /home/user/spotify_to_ytmusic
while pgrep -f ab18.sh >/dev/null; do sleep 30; done
U=http://127.0.0.1:8766/b2k18_dbg.html?fast=1
node t16/b2k.js "$U" qa18/s_fra fra > qa18/s_fra.log 2>&1; echo s_fra $?
node t16/b2k.js "$U" qa18/s_ath ath > qa18/s_ath.log 2>&1; echo s_ath $?
SC=./scen_water.js node t16/b2k.js "$U" qa18/s_water fra > qa18/s_water.log 2>&1; echo s_water $?
NOGAS=1 node t16/race.js "$U" qa18/s_race > qa18/s_race.log 2>&1; echo s_race $?
SC=./scen_perf.js node t16/b2k.js "http://127.0.0.1:8766/b2k18_dbg.html" qa18/s_perf fra > qa18/s_perf.log 2>&1; echo s_perf $?
node t4/nbside.js "http://127.0.0.1:8766/b2k18_dbg.html" qa18/s_side > qa18/s_side.log 2>&1; echo s_side $?
