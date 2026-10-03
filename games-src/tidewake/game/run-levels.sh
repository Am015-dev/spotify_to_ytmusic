#!/bin/bash
cd "$(dirname "$0")"
node gauntlet.js 30 easy 2,4,8 out/g_easy.json > out/gauntlet_easy.txt 2>&1 &
node gauntlet.js 30 hard 2,4,8 out/g_hard.json > out/gauntlet_hard.txt 2>&1 &
node tools/vs.js hard normal 2 1500 > out/vs1.txt 2>&1 &
node tools/vs.js normal easy 2 1500 > out/vs2.txt 2>&1 &
node tools/vs.js hard easy 4 600 > out/vs3.txt 2>&1 &
wait
