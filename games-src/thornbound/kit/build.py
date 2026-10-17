#!/usr/bin/env python3
# Builds kit.js from parts/*.js (+ base64 fonts) and demo.html from demo-src.html (kit inlined).
import glob, base64, json, os
H = os.path.dirname(os.path.abspath(__file__))
fonts = {k: base64.b64encode(open(f'{H}/fonts/{k}.woff2', 'rb').read()).decode() for k in ('cinzel', 'fell', 'fellit')}
body = '\n'.join(open(p).read() for p in sorted(glob.glob(f'{H}/parts/p*.js')))
body = body.replace('/*FONTS*/{}', json.dumps(fonts))
js = '/* TBKit - The Thornbound Throne visual kit. Procedural SVG/CSS, no external assets. Fonts: Cinzel + IM Fell English (OFL, embedded). */\n(function (global) {\n\'use strict\';\n' + body + '\n})(typeof window !== "undefined" ? window : this);\n'
open(f'{H}/kit.js', 'w').write(js)
print('kit.js', len(js))
src = f'{H}/demo-src.html'
if os.path.exists(src):
    html = open(src).read().replace('<!--KIT-->', '<script>' + js.replace('</script', '<\\/script') + '</script>')
    open(f'{H}/demo.html', 'w').write(html); print('demo.html', len(html))
