# Builds wickdeep.html (one self-contained file) and x.js (all scripts joined, for node --check).
# Shelf shell inlined from games-src/shell (never copied): gx-scenario, shell.js + gx-kit + gx-viewport, plus gameaudio.
import os, re, base64
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..'))
S = os.path.join(D, 'src')
rd = lambda p: open(p, encoding='utf-8').read()
parts = sorted((f for f in os.listdir(S) if re.match(r'ui\d+\.js$', f)), key=lambda f: int(re.findall(r'\d+', f)[0]))
open(os.path.join(D, 'ui.js'), 'w', encoding='utf-8').write(''.join(rd(os.path.join(S, f)) for f in parts))
art = 'window.WD_ART=' + repr('data:image/png;base64,' + base64.b64encode(open(os.path.join(D, 'art', 'tiny-dungeon.png'), 'rb').read()).decode()) + ';\n'
fx = ''.join(rd(os.path.join(D, 'fx', f + '.js')) + '\n' for f in ('slash', 'impact', 'heal', 'shield'))
SH = lambda f: os.path.join(SP, 'shell', f)
SRC = {'gx-scenario.js': SH('gx-scenario.js'), 'scn.js': os.path.join(S, 'scn.js'), 'shell.js': SH('shell.js'), 'gx-kit.js': SH('gx-kit.js'), 'gx-viewport.js': SH('gx-viewport.js'), 'gx-scenario-tutor.js': SH('gx-scenario-tutor.js'),
       'fx.js': None, 'data.js': os.path.join(S, 'data.js'), 'scen.js': os.path.join(S, 'scen.js'),
       'engine.js': os.path.join(S, 'engine.js'), 'ai.js': os.path.join(S, 'ai.js'), 'camp.js': os.path.join(S, 'camp.js'), 'ui.js': os.path.join(D, 'ui.js'), 'lessons.js': os.path.join(S, 'lessons.js')}
css = '\n'.join(rd(SH(f)) for f in ('shell.css', 'gx-kit.css', 'gx-scenario-tutor.css')) + '\n' + rd(os.path.join(S, 'style.css'))
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
fonts = ''.join("@font-face{font-family:'%s';font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}\n" % (n, w, b64(p)) for n, w, p in (
    ('Silkscreen', 700, os.path.join(D, 'art', 'silkscreen-700.woff2')), ('Silkscreen', 400, os.path.join(D, 'art', 'silkscreen-400.woff2')),
    ('Alegreya Sans', 400, SH('fonts/alegreya-sans-400.woff2')), ('Alegreya Sans', 700, SH('fonts/alegreya-sans-700.woff2'))))
h = rd(os.path.join(S, 'head.html')).replace('/*FONTS*/', fonts).replace('/*CSS*/', css)
body = rd(os.path.join(S, 'body.html'))
for f, p in SRC.items():
    tag = '<script src="%s"></script>' % f; assert tag in body, f
    src = fx if f == 'fx.js' else rd(p)
    if f == 'data.js': src = art + src
    body = body.replace(tag, '<script>\n' + src.replace('</script', '<\\/script') + '\n</script>')
out = h + body
open(os.path.join(D, 'wickdeep.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('wickdeep.html', len(out.encode('utf-8')), 'bytes')
