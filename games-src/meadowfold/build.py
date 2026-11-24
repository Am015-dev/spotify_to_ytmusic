# Builds meadowfold.html (one self-contained file) and x.js (all scripts joined, for node --check). Shared shell files are inlined read-only from games-src/shell/.
import os, re
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..'))
S = os.path.join(D, 'src'); SH = os.path.join(SP, 'shell')
rd = lambda p: open(p, encoding='utf-8').read()
SRC = {'gx-scenario.js': os.path.join(SH, 'gx-scenario.js'), 'scn.js': os.path.join(S, 'scn.js'), 'shell.js': os.path.join(SH, 'shell.js'), 'gx-kit.js': os.path.join(SH, 'gx-kit.js'),
       'gx-viewport.js': os.path.join(SH, 'gx-viewport.js'), 'gameaudio.js': os.path.join(SP, 'audio', 'gameaudio.js'),
       'icons.js': os.path.join(S, 'icons.js'), 'data.js': os.path.join(S, 'data.js'), 'engine.js': os.path.join(S, 'engine.js'), 'ai.js': os.path.join(S, 'ai.js'),
       'art.js': os.path.join(S, 'art.js'), 'ui.js': os.path.join(S, 'ui.js'), 'tutor.js': os.path.join(S, 'tutor.js')}
css_shell = rd(os.path.join(SH, 'shell.css')) + '\n' + rd(os.path.join(SH, 'gx-kit.css'))
h = rd(os.path.join(S, 'head.html')).replace('/*SHELL_CSS*/', css_shell).replace('/*GAME_CSS*/', rd(os.path.join(S, 'skin.css')))
body = rd(os.path.join(S, 'body.html'))
for f, p in SRC.items():
    tag = '<script src="%s"></script>' % f; assert tag in body, f
    body = body.replace(tag, '<script>\n' + rd(p).replace('</script', '<\\/script') + '\n</script>')
out = h + body
open(os.path.join(D, 'meadowfold.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('meadowfold.html', len(out.encode('utf-8')), 'bytes')
