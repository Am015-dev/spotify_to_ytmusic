#!/usr/bin/env bash
cd /home/user/spotify_to_ytmusic
SEED=3 FAST=1 MODE=phone CITIES=ath MIN=4 SHOTS=1 node t16/tPlayDbg.js "http://127.0.0.1:8766/b2k18c_dbg.html?fast=1" qa18/stk3 > qa18/stk3.log 2>&1; echo stk3 $?; grep STUCKAT qa18/stk3.log
SC=./scen_water.js node t16/b2k.js "http://127.0.0.1:8766/b2k18c_dbg.html?fast=1" qa18/s_water3 fra > qa18/s_water3.log 2>&1; echo water $?
