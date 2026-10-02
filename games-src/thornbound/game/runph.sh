#!/bin/bash
cd "$(dirname "$0")"; rm -f /tmp/phdone.txt
for s in 844x390 360x740 740x360; do timeout 900 node lay-phone.js $s > /tmp/p_$s.txt 2>&1; done
echo done > /tmp/phdone.txt
