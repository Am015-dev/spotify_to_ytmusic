# Builds via-tessera.html (one self-contained file) and x.js (all scripts joined, for node --check).
# Shared parts inlined from games-src/shell (never copied): gx-scenario.js, shell.js, shell.css. Game sources live in src/.
import os, re
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..')); S = os.path.join(D, 'src')
rd = lambda p: open(p, encoding='utf-8').read()
SH = lambda f: os.path.join(SP, 'shell', f)
parts = sorted((f for f in os.listdir(S) if re.match(r'ui\d+\.js$', f)), key=lambda f: int(re.findall(r'\d+', f)[0]))
SRC = [('gx-scenario.js', SH('gx-scenario.js')), ('scn.js', os.path.join(S, 'scn.js')), ('shell.js', SH('shell.js')), ('icons.js', os.path.join(S, 'icons.js')),
       ('data.js', os.path.join(S, 'data.js')), ('engine.js', os.path.join(S, 'engine.js')), ('ai.js', os.path.join(S, 'ai.js')), ('art.js', os.path.join(S, 'art.js'))] + [(f, os.path.join(S, f)) for f in parts]
css = rd(SH('shell.css')) + '\n' + rd(os.path.join(S, 'style.css'))
h = rd(os.path.join(S, 'head.html')).replace('/*CSS*/', css)
body = rd(os.path.join(S, 'body.html'))
js = ''.join('<script>\n/* %s */\n%s\n</script>\n' % (f, rd(p).replace('</script', '<\\/script')) for f, p in SRC)
out = h + body.replace('<!--SCRIPTS-->', js)
open(os.path.join(D, 'via-tessera.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('via-tessera.html', len(out.encode('utf-8')), 'bytes')
