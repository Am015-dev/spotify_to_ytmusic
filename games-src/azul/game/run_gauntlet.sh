#!/bin/sh
# every player count x every variant combination, normal computers; then mixed levels
cd "$(dirname "$0")"
for np in 2 3 4; do for ex in base gray prism gray,prism; do node gauntlet.js 50 $np $ex; done; done
echo "--- mixed levels (seat order rotates) ---"
node gauntlet.js 40 2 base hard,normal; node gauntlet.js 40 2 base normal,hard
node gauntlet.js 40 2 base normal,easy; node gauntlet.js 40 2 base easy,normal
node gauntlet.js 20 3 gray,prism hard,normal,easy; node gauntlet.js 20 4 base hard,hard,hard,hard
