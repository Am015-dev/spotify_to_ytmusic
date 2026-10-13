#!/usr/bin/env bash
# wait for g9iter done.txt (bounded), print it
cd "$(dirname "$0")/g11/iter"; for i in $(seq 1 150); do [ -f done.txt ] && break; python3 -c "import time;time.sleep(1)"; done; grep -v '^ERRS' done.txt; grep '^ERRS' done.txt | grep -v 'GPU stall' | grep -o '"[^"]*"' | grep -v 'GPU stall' | head -3
