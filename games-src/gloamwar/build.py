# Builds gloamwar.html (one self-contained file) and x.js (all scripts joined, for node --check). Shared kit files are inlined from ../shell.
import os, re, json, base64
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..'))
S = os.path.join(D, 'src'); SH = os.path.join(SP, 'shell')
rd = lambda p: open(p, encoding='utf-8').read()
SRC = {'gx-scenario.js': os.path.join(SH, 'gx-scenario.js'), 'scn.js': os.path.join(S, 'scn.js'), 'shell.js': os.path.join(SH, 'shell.js'), 'gx-kit.js': os.path.join(SH, 'gx-kit.js'),
       'gx-viewport.js': os.path.join(SH, 'gx-viewport.js'), 'gx-help.js': os.path.join(SH, 'gx-help.js'), 'gx-tutor.js': os.path.join(SH, 'gx-tutor.js'),
       'gameaudio.js': os.path.join(SP, 'audio', 'gameaudio.js'),
       'icons.js': os.path.join(S, 'icons.js'), 'map.js': os.path.join(S, 'map.js'), 'data.js': os.path.join(S, 'data.js'), 'cards.js': os.path.join(S, 'cards.js'),
       'engine.js': os.path.join(S, 'engine.js'), 'combat.js': os.path.join(S, 'combat.js'), 'effects.js': os.path.join(S, 'effects.js'), 'ai.js': os.path.join(S, 'ai.js'),
       'mapview.js': os.path.join(S, 'mapview.js'), 'ui.js': os.path.join(S, 'ui.js'), 'sheets.js': os.path.join(S, 'sheets.js'), 'tutor.js': os.path.join(S, 'tutor.js'),
       'gx-scenario-tutor.js': os.path.join(SH, 'gx-scenario-tutor.js'), 'lessons.js': os.path.join(S, 'lessons.js')}
font = lambda fam, f: "@font-face{font-family:'%s';font-weight:400;font-style:normal;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, base64.b64encode(open(os.path.join(S, f), 'rb').read()).decode())
css = '\n'.join(rd(os.path.join(SH, f)) for f in ('shell.css', 'gx-kit.css', 'gx-help.css', 'gx-tutor.css', 'gx-menu.css', 'gx-scenario-tutor.css'))
css = font('IM Fell English', 'fell-r.woff2') + font('IM Fell English SC', 'fell-sc.woff2') + '\n' + css
h = rd(os.path.join(S, 'head.html')).replace('/*SHELL_CSS*/', css)
body = rd(os.path.join(S, 'body.html'))
for f, p in SRC.items():
    tag = '<script src="%s"></script>' % f; assert tag in body, f
    body = body.replace(tag, '<script>\n' + rd(p).replace('</script', '<\\/script') + '\n</script>')
out = h + body
open(os.path.join(D, 'gloamwar.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('gloamwar.html', len(out.encode('utf-8')), 'bytes')
