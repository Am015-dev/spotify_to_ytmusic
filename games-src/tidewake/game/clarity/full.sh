#!/bin/bash
# The full test set for the clarity pass, one after another (run from anywhere). Needs PW=<playwright module> and NODE_PATH for clarity/*.js.
cd "$(dirname "$0")/.."; mkdir -p out; H=../../scripts/heavy
node rules-test.js > out/f-rules.txt 2>&1; tail -1 out/f-rules.txt
node hidden-test.js 40 > out/f-hidden.txt 2>&1; tail -2 out/f-hidden.txt
node tools/net-strip-test.js > out/f-strip.txt 2>&1; tail -2 out/f-strip.txt
node click.js > out/f-click.txt 2>&1; grep TOTAL out/f-click.txt
$H node clarity/reveal-order.js http://127.0.0.1:8812/tidewake.html 4 > out/f-reveal.txt 2>&1; tail -1 out/f-reveal.txt
$H node clarity/reveal-order.js http://127.0.0.1:8812/tidewake.html 2 1366x768 > out/f-reveal-d.txt 2>&1; tail -1 out/f-reveal-d.txt
$H node lay.js 1366x768,1920x1080,768x1024,1100x700 > out/f-lay.txt 2>&1; grep -E "^PROBLEMS|SIZE" out/f-lay.txt
$H node lay-phone.js 390x844,390x763,390x664,375x553,412x780,844x390,750x342 > out/f-layph.txt 2>&1; grep -E "^PROBLEMS|SIZE" out/f-layph.txt
for s in full leave timeout ui; do PORT=17775 $H node ../../net/p2p-tw.js tidewake.html $s > out/f-p2p-$s.txt 2>&1 </dev/null; echo "p2p $s: $(tail -1 out/f-p2p-$s.txt | cut -c1-160)"; done
