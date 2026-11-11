#!/bin/bash
# usage: run.sh tag seeds jobs...   (AIFILE env optional) ; outputs out2/<tag>_<job>.json
cd "$(dirname "$0")"; tag=$1; seeds=$2; shift 2
for j in "$@"; do node gauntlet.js $j $j $seeds hard out2/${tag}_$j.json > out2/${tag}_$j.txt 2>&1 & done; wait
