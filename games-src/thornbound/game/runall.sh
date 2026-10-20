#!/bin/bash
# Board-first checks (lay.js / lay-phone.js tested the retired dock layout; sweep.js + build-all.py's phone-check replace them)
cd "$(dirname "$0")"
node rules-test.js | tail -3; node hidden-test.js 12 | tail -2; node ui-test.js | tail -2
node click.js 0 9 1 | tail -3
node sweep.js 20 390x763,375x553 4
node finger-test.js
