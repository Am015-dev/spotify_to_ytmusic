# Builds onyx-atelier.html (one self-contained file, fonts inlined) and x.js (all scripts joined, for node --check).
import os, re, base64
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..')); S = os.path.join(D, 'src')
def rd(p): return open(p, encoding='utf-8').read()
def face(fam, w, f): return "@font-face{font-family:'%s';font-weight:%s;font-style:normal;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, w, base64.b64encode(open(os.path.join(D, 'fonts', f), 'rb').read()).decode())
fonts = '/* Limelight and Josefin Sans: SIL Open Font License 1.1 (fonts/OFL-*.txt) */\n' + face('Limelight', 400, 'limelight-400.woff2') + face('Josefin Sans', '100 700', 'josefin-sans-var.woff2')
SRC = {'gx-scenario.js': os.path.join(SP, 'shell', 'gx-scenario.js')}
for f in ('scn.js', 'data.js', 'engine.js', 'ai.js', 'art.js', 'ui.js', 'tutor.js'): SRC[f] = os.path.join(S, f)
h = rd(os.path.join(S, 'head.html')).replace('/*FONTS*/', fonts)
body = rd(os.path.join(S, 'body.html'))
for f, p in SRC.items():
    tag = '<script src="%s"></script>' % f
    assert tag in body, f
    body = body.replace(tag, '<script>\n' + rd(p).replace('</script', '<\\/script') + '\n</script>')
out = h + body
open(os.path.join(D, 'onyx-atelier.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('onyx-atelier.html', len(out.encode('utf-8')), 'bytes')
