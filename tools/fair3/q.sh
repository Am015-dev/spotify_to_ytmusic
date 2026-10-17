#!/bin/bash
# q.sh <city> <file.js> : run probe, print output
D=${PRD:-/tmp/fair3}/$1;n=$(date +%s%N);cp "$2" $D/$n.js;for i in $(seq 1 1200);do [ -f $D/$n.out ]&&break;sleep 0.5;done;cat $D/$n.out;echo
