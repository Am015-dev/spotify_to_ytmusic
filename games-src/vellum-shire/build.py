# Builds vellum-shire.html (one self-contained file) and x.js (all scripts joined, for node --check). Paths are repo-relative.
import os, re, base64
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..'))
S = os.path.join(D, 'src')
rd = lambda p: open(p, encoding='utf-8').read()
sh = lambda f: os.path.join(SP, 'shell', f)
SRC = {'gx-scenario.js': sh('gx-scenario.js'), 'shell.js': sh('shell.js'), 'gx-kit.js': sh('gx-kit.js'), 'gx-viewport.js': sh('gx-viewport.js'),
       'gx-help.js': sh('gx-help.js'), 'gx-tutor.js': sh('gx-tutor.js')}
for f in ('scn.js', 'icons.js', 'data.js', 'engine.js', 'ai.js', 'ui1.js', 'ui2.js', 'ui3.js'):
    SRC[f] = os.path.join(S, f)
css = '\n'.join(rd(sh(f)) for f in ('shell.css', 'gx-kit.css', 'gx-help.css', 'gx-tutor.css'))
def face(fam, f):
    b = base64.b64encode(open(os.path.join(D, 'fonts', f), 'rb').read()).decode()
    return "@font-face{font-family:'%s';font-style:normal;font-weight:400;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, b)
fonts = face('Uncial Antiqua', 'UncialAntiqua.woff2') + face('UnifrakturMaguntia', 'UnifrakturMaguntia.woff2') + face('IM Fell English', 'IMFellEnglish.woff2')
h = rd(os.path.join(S, 'head.html')).replace('/*SHELL_CSS*/', css).replace('/*FONTS*/', fonts)
body = rd(os.path.join(S, 'body.html'))
for f in re.findall(r'<script src="([^"]+)"></script>', body):
    tag = '<script src="%s"></script>' % f
    body = body.replace(tag, '<script>\n' + rd(SRC[f]).replace('</script', '<\\/script') + '\n</script>')
out = h + body
open(os.path.join(D, 'vellum-shire.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('vellum-shire.html', len(out.encode('utf-8')), 'bytes')
