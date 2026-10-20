#!/usr/bin/env python3
# Blocks helpers and cloud sessions started without an explicit model (the default is the most expensive one).
import json, sys
d = json.load(sys.stdin)
if not (d.get("tool_input") or {}).get("model"):
    sys.stderr.write("Set `model` explicitly (see CLAUDE.md cost rules): sonnet for building, fixing and testers; "
                     "haiku for downloads and simple loops; the main model only for planning and review.\n")
    sys.exit(2)
