#!/bin/bash
# runs every suite in parallel and prints the summaries (each suite is < 5 min)
cd "$(dirname "$0")"; mkdir -p out
node gauntlet.js 150 normal 2,3,4 out/g_a.json > out/gauntlet_a.txt 2>&1 &
node gauntlet.js 100 normal 5,6 out/g_b.json > out/gauntlet_b.txt 2>&1 &
node gauntlet.js 100 normal 7,8 out/g_c.json > out/gauntlet_c.txt 2>&1 &
node cover.js 60 > out/cover.txt 2>&1 &
node hidden-test.js 40 > out/hidden.txt 2>&1 &
node rules-test.js > out/rules.txt 2>&1 &
wait
grep -hE "TOTAL|INV|UNFIN|STALL|REJ|EXC" out/gauntlet_*.txt; tail -1 out/rules.txt; tail -2 out/cover.txt | cut -c1-200; tail -2 out/hidden.txt
