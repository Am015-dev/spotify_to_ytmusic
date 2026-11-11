#!/usr/bin/env python3
"""Add the copyright notice to the head of each published game page.

Run after copying a fresh build into games/<slug>/index.html. Safe to run
again: pages that already carry the notice are left alone.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2] / "games"
MARK = "Copyright (c) 2026 Am015-dev. All rights reserved."
STAMP = ("<!-- " + MARK + " Not licensed for copying, modification or "
         "redistribution; see LICENSE in the source repository. -->"
         '<meta name="copyright" content="&copy; 2026 Am015-dev. All rights reserved.">')
# Pages another session owns; they stamp their own builds.
SKIP = {"mainhattan-nightrun", "mainhattan-overdrive"}

def pages(args):
    if args:
        return [pathlib.Path(a).resolve() for a in args]
    return [p for p in sorted(ROOT.glob("*/index.html")) if p.parent.name not in SKIP] + \
           [ROOT / "index.html", ROOT / "reference.html"]

for page in pages(sys.argv[1:]):
    html = page.read_text(encoding="utf-8")
    if MARK in html:
        continue
    new, n = re.subn(r"(<head(?:\s[^>]*)?>)", lambda m: m.group(1) + STAMP, html, count=1, flags=re.I)
    if not n:
        sys.exit(f"no <head> in {page}")
    page.write_text(new, encoding="utf-8")
    print("stamped", page.relative_to(ROOT.parent))
