#!/bin/sh
# runs lay.js one size at a time (each size takes ~4-20 min on SwiftShader)
cd "$(dirname "$0")"
for s in 1366x768 390x844 768x1024 1920x1080; do timeout 1700 node lay.js $s > out/lay_$s.txt 2>&1; done
echo LAYDONE >> out/lay_1920x1080.txt
