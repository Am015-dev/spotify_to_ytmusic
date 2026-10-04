#!/bin/bash
# mk.sh <name> <port> [split]  : make an isolated test dir with its own server
S=/tmp/claude-0/-home-user-spotify-to-ytmusic/6d0e66a9-b7fc-595a-b61f-ed65e4650524/scratchpad; K=/home/user/spotify_to_ytmusic
D=$S/run/$1; rm -rf $D; mkdir -p $D; cd $K
cp *.js *.py *.html *.mjs $D/ 2>/dev/null; cp tools/*.js $D/; ln -s $K/node_modules $D/node_modules
cd $D; sed -i "s/127\.0\.0\.1:8766/127.0.0.1:$2/g" *.js
if [ "$3" = split ]; then for f in local_dbg.html local.html; do python3 $K/tools/split_km.py $f sp >/dev/null && mv sp/overdrive.html $f && mv sp/km.js km.js; done; rmdir sp; fi
grep -l 8766 *.js && echo "STALE PORT"; (setsid nohup python3 -m http.server $2 >/dev/null 2>&1 &); sleep 1; curl -s -o /dev/null -w "$1 :$2 %{http_code}\n" http://127.0.0.1:$2/local_dbg.html
