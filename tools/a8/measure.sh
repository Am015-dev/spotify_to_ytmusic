#!/bin/bash
# measure.sh <page> <port> <tag>: boot dev.js, terrain counts + per-spot render info, kill
cd /home/user/spotify_to_ytmusic; L=/tmp/claude-0/m_$3.log; node tools/dev.js http://127.0.0.1:8798/$1 fra $2 > $L 2>&1 & PID=$!
until grep -qE "BOOTED|rror" $L; do sleep 3; done
echo "$3 $(curl -s localhost:$2/eval --data-binary @/tmp/claude-0/sc/cnt.js) $(curl -s localhost:$2/eval --data-binary @/tmp/claude-0/vis.js)"
kill -9 $PID
