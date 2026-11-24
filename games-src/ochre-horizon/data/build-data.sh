#!/bin/sh
# Rebuild the card data: author -> corp redesign -> tile structure -> validate -> game/src/data.js
set -e; cd "$(dirname "$0")"
python3 author.py --write >/dev/null; python3 corps_patch.py; python3 tiles_patch.py; node validate.js | tail -1; python3 ../game/gen-data.py
