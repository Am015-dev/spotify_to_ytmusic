#!/usr/bin/env python3
"""Regenerates videos.html for the local owner app: every proof video in the repo, newest first, with its date."""
import subprocess, os, html, datetime
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
files = subprocess.check_output(['git', 'ls-files'], cwd=R, text=True).split('\n')
vids = [f for f in files if f.startswith('games-src/') and '/proof/' in f and f.endswith(('.webm', '.mp4'))]
rows = []
for f in vids:
    t = subprocess.check_output(['git', 'log', '-1', '--format=%ct', '--', f], cwd=R, text=True).strip()
    ts = int(t or 0)
    game = f.split('/')[1]
    rows.append((ts, game, f, os.path.getsize(os.path.join(R, f)) / 1e6))
rows.sort(reverse=True)
h = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Videos</title>
<style>body{margin:0;padding:12px;background:#141311;color:#ece7df;font:15px/1.4 system-ui}h1{font-size:19px;margin:4px 0}a{color:#7fb0e0}section{margin:0 0 22px}video{width:100%;max-width:420px;border-radius:10px;background:#000;display:block}p{margin:0 0 6px}.m{color:#a39c90;font-size:13px}</style></head><body>
<h1>Videos</h1><p class="m"><a href="index.html">Back to the panel</a> · every proof video in the repo, newest first. Date = when it was committed; the live site may be newer.</p>
'''
for ts, game, f, mb in rows:
    d = datetime.datetime.fromtimestamp(ts, datetime.UTC).strftime('%d %b %H:%M UTC')
    h += f'<section><p><b>{html.escape(game)}</b> <span class="m">{d} · {mb:.1f} MB · {html.escape(os.path.basename(f))}</span></p><video src="pv/{html.escape(f[len("games-src/"):])}" controls playsinline preload="none"></video></section>\n'
open(os.path.join(os.path.dirname(__file__), 'videos.html'), 'w').write(h + '</body></html>')
print(len(rows), 'videos')
