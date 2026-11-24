#!/bin/bash
# balance: 4 parallel gauntlets of N games each. bash bal.sh N levelD levelG
N=${1:-3}; for i in 0 1 2 3; do node gauntlet.js $N ${2:-normal} ${3:-normal} $((i*100)) > /tmp/gw-bal-$i.txt 2>&1 & done; wait; cat /tmp/gw-bal-*.txt
