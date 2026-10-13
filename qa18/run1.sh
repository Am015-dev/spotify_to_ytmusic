#!/usr/bin/env bash
cd /home/user/spotify_to_ytmusic
U=http://127.0.0.1:8766
node t16/b2k.js "$U/b2k18_dbg.html?fast=1" qa18/b2k_fra fra > qa18/b2k_fra.log 2>&1; echo b2k_fra $?
NOGAS=1 node t16/race.js "$U/b2k18_dbg.html?fast=1" qa18/race_nogas > qa18/race_nogas.log 2>&1; echo race $?
for v in b2k18 base18; do TRACK=grand LAPS=1 node tools/tRace.js "$U/${v}_dbg.html" qa18/tr_$v > qa18/tr_$v.log 2>&1; echo tr_$v $?; done
