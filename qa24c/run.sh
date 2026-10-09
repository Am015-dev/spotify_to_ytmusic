#!/bin/bash
# live vs branch tPlay, phone, 60 fps (FAST) and 30 fps; two at a time
cd "$(dirname "$0")/.."
L=http://127.0.0.1:8767/local_dbg.html; B=http://127.0.0.1:8766/local_dbg.html
MODE=phone FAST=1 node tools/tPlay.js $L qa24c/live60 > qa24c/live60.log 2>&1 &
MODE=phone FAST=1 node tools/tPlay.js $B qa24c/br60 > qa24c/br60.log 2>&1 &
wait
MODE=phone FPS=30 THROTTLE=1 node tools/tPlay.js $L qa24c/live30 > qa24c/live30.log 2>&1 &
MODE=phone FPS=30 THROTTLE=1 node tools/tPlay.js $B qa24c/br30 > qa24c/br30.log 2>&1 &
wait
echo ALLDONE
