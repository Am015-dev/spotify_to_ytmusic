#!/bin/bash
# ev.sh <city> '<js>'   |  ev.sh <city> -f file.js
c=$1;shift; if [ "$1" = -f ]; then curl -s --max-time 900 -X POST "http://127.0.0.1:8897/eval?city=$c" --data-binary @"$2"; else curl -s --max-time 900 -X POST "http://127.0.0.1:8897/eval?city=$c" --data-binary "$1"; fi; echo
