# Builds via-tessera.html (one self-contained file) and x.js (all scripts joined, for node --check).
# Shared part inlined from games-src/shell (never copied): gx-scenario.js (the ?scn= test states). Game sources live in src/;
# the numbered src/ui1..uiN.js parts are joined into ui.js (generated, git-ignored).
import os, re
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..')); S = os.path.join(D, 'src')
rd = lambda p: open(p, encoding='utf-8').read()
SH = lambda f: os.path.join(SP, 'shell', f)
parts = sorted((f for f in os.listdir(S) if re.match(r'ui\d+\.js$', f)), key=lambda f: int(re.findall(r'\d+', f)[0]))
open(os.path.join(D, 'ui.js'), 'w', encoding='utf-8').write(''.join(rd(os.path.join(S, f)) for f in parts))
SRC = {'gx-scenario.js': SH('gx-scenario.js'), 'scn.js': os.path.join(S, 'scn.js'), 'icons.js': os.path.join(S, 'icons.js'), 'data.js': os.path.join(S, 'data.js'),
       'engine.js': os.path.join(S, 'engine.js'), 'ai.js': os.path.join(S, 'ai.js'), 'art.js': os.path.join(S, 'art.js'), 'ui.js': os.path.join(D, 'ui.js'),
       'gx-scenario-tutor.js': SH('gx-scenario-tutor.js'), 'lessons.js': os.path.join(S, 'lessons.js')}
h = rd(os.path.join(S, 'head.html')).replace('/*CSS*/', rd(os.path.join(S, 'style.css')) + '\n' + rd(SH('gx-scenario-tutor.css')))
body = rd(os.path.join(S, 'body.html'))
# optional lesson sets (scenario lists on window.VTSCN): inlined when present, the script tag is dropped when missing
for f in ('lessons-a.js', 'lessons-b.js', 'lessons-c.js', 'lessons-d.js'):
    p = os.path.join(S, f)
    if os.path.exists(p): SRC[f] = p
    else: body = body.replace('<script src="%s"></script>' % f, '')
for f, p in SRC.items():
    tag = '<script src="%s"></script>' % f; assert tag in body, f
    body = body.replace(tag, '<script>\n' + rd(p).replace('</script', '<\\/script') + '\n</script>')
out = h + body
open(os.path.join(D, 'via-tessera.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('via-tessera.html', len(out.encode('utf-8')), 'bytes')
