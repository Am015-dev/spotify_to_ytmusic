#!/bin/bash
# mkrun.sh <name> <port> : isolated SPLIT test dir from the current local_dbg.html (own server/port)
K=/home/user/spotify_to_ytmusic; D=/tmp/claude-0/run/$1; rm -rf $D; mkdir -p $D; cd $K
cp local_dbg.html $D/; python3 tools/split_km.py $D/local_dbg.html $D/sp >/dev/null && mv $D/sp/overdrive.html $D/local_dbg.html && mv $D/sp/km.js $D/km.js && rmdir $D/sp
ln -s $K/node_modules $D/node_modules; cd $D; (setsid nohup python3 -m http.server $2 >/dev/null 2>&1 &); sleep 1
curl -s -o /dev/null -w "$1 :$2 %{http_code}\n" http://127.0.0.1:$2/local_dbg.html
