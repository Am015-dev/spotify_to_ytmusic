#!/usr/bin/env bash
cd /home/user/spotify_to_ytmusic
NOGAS=1 node t16/race.js "http://127.0.0.1:8766/b2k18d_dbg.html?fast=1" qa18/s_race4 > qa18/s_race4.log 2>&1; echo race $?
SC=./scen_water.js node t16/b2k.js "http://127.0.0.1:8766/b2k18d_dbg.html?fast=1" qa18/s_water4 ath > qa18/s_water4.log 2>&1; echo water $?
