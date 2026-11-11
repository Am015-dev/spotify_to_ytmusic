#!/bin/bash
cd "$(dirname "$0")"
rm -f /tmp/alldone.txt
for s in 1366x768 1920x1080 768x1024; do timeout 250 node lay.js $s > /tmp/l_$s.txt 2>&1; done
for s in 390x844 844x390 360x740 740x360; do timeout 280 node lay-phone.js $s > /tmp/p_$s.txt 2>&1; done
timeout 280 node click.js 4 9 1 > /tmp/c3.txt 2>&1
echo done > /tmp/alldone.txt
