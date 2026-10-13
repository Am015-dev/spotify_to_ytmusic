#!/bin/bash
# ci.sh: trunk CI for alex/od-int2. If origin has commits we have not tested: merge them, build the next version, run SMOKE (+ TAG of the changed lanes), print one result line.
# usage: tools/ci.sh <version> [TAG list]   (env: SCR=<scratch dir>)
V=$1; TG=$2; SCR=${SCR:-/tmp/ci}; mkdir -p $SCR
git fetch -q origin alex/od-int2 || exit 2
N=$(git log --oneline HEAD..FETCH_HEAD | wc -l)
[ "$N" = 0 ] && { echo "CI: nothing new on origin/alex/od-int2 ($(git rev-parse --short HEAD))"; exit 0; }
git merge --no-edit FETCH_HEAD >/dev/null 2>&1 || { echo "CI: merge conflict"; git merge --abort; exit 3; }
echo "CI: $N new commit(s): $(git log --no-merges --format='%h %an %s' HEAD~$N..HEAD | cut -c1-80 | head -5 | tr '\n' '|')"
B0=$(date +%s); tools/build.sh $V 2>&1 | grep -E "BUILD_OK|rror" | cut -c1-90; echo "build $(( $(date +%s)-B0 ))s"
rm -rf out/int2dev; mkdir -p out/int2dev; cp -r out/$V/* out/int2dev/
pkill -f "http.server 8812" 2>/dev/null; (cd out/int2dev && nohup python3 -m http.server 8812 >/dev/null 2>&1 &); sleep 1
SMOKE=1 tools/tGo.sh http://localhost:8812/index.html $SCR/smoke
[ -n "$TG" ] && TAG=$TG tools/tGo.sh http://localhost:8812/index.html $SCR/tag
