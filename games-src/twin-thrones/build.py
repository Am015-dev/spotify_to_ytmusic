# Builds twin-thrones.html (one self-contained file) and x.js (all scripts joined, for node --check). Repo-relative paths.
import os, re, json
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..')); REPO = os.path.abspath(os.path.join(SP, '..'))
S = os.path.join(D, 'src')
def rd(p): return open(p, encoding='utf-8').read()
# art slots: assets.json is the manifest; files in games/twin-thrones/media/<stem>.(webp|png) that exist NOW fill their slot (no 404s for the rest)
man = json.load(open(os.path.join(D, 'assets.json'), encoding='utf-8'))
media = os.path.join(REPO, 'games', 'twin-thrones', 'media')
have = {}
for it in man['items']:
    for ext in ('webp', 'png'):
        if os.path.exists(os.path.join(media, it['stem'] + '.' + ext)): have[it['stem']] = 'media/%s.%s' % (it['stem'], ext); break
meta = {i['stem']: {'kind': i['kind'], 'w': i['w'], 'h': i['h']} for i in man['items']}
ASSETS_JS = 'var TT_ASSETS = %s;\nvar TT_HAVE = %s;\n' % (json.dumps(meta, separators=(',', ':')), json.dumps(have, separators=(',', ':')))
SRC = {'shell.js': os.path.join(SP, 'shell', 'shell.js'), 'gx-scenario.js': os.path.join(SP, 'shell', 'gx-scenario.js'), 'scn.js': os.path.join(S, 'scn.js'), 'assets.js': None, 'art.js': os.path.join(S, 'art.js'), 'data.js': os.path.join(S, 'data.js'), 'engine.js': os.path.join(S, 'engine.js'), 'ai.js': os.path.join(S, 'ai.js'), 'ui.js': os.path.join(S, 'ui.js')}
h = rd(os.path.join(S, 'head.html')).replace('/*SHELL_CSS*/', rd(os.path.join(SP, 'shell', 'shell.css')))
body = rd(os.path.join(S, 'body.html'))
for f, p in SRC.items():
    tag = '<script src="%s"></script>' % f
    assert tag in body, f
    src = (ASSETS_JS if p is None else rd(p)).replace('</script', '<\\/script')
    body = body.replace(tag, '<script>\n' + src + '\n</script>')
out = h + body
open(os.path.join(D, 'twin-thrones.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('twin-thrones.html', len(out.encode('utf-8')), 'bytes;', len(have), 'of', len(man['items']), 'art slots filled')
