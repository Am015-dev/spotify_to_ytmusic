# Builds redline-rally.html (one self-contained file) and x.js (all scripts joined, for node --check).
import os, re, json, glob
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..')); REPO = os.path.abspath(os.path.join(SP, '..'))
S = os.path.join(D, 'src')
rd = lambda p: open(p, encoding='utf-8').read()
# assets.json = the manifest of every picture slot; media/<stem>.webp files that exist are listed so the page never requests a missing file
man = json.load(open(os.path.join(D, 'assets.json'), encoding='utf-8'))
media = os.path.join(REPO, 'games', 'redline-rally', 'media')
have = sorted(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(media, '*.webp')))
have = [h for h in have if h in {i['stem'] for i in man['items']}]
pre = 'window.RR_ASSETS=' + json.dumps({'items': [{k: i[k] for k in ('stem', 'kind', 'w', 'h', 'ratio', 'alpha', 'wave')} for i in man['items']]}, separators=(',', ':')) + ';window.RR_HAVE=' + json.dumps(have) + ';\n'
SRC = {'gx-scenario.js': os.path.join(SP, 'shell', 'gx-scenario.js'), 'scn.js': os.path.join(S, 'scn.js'), 'data.js': os.path.join(S, 'data.js'), 'track.js': os.path.join(S, 'track.js'), 'engine.js': os.path.join(S, 'engine.js'), 'ai.js': os.path.join(S, 'ai.js'), 'art.js': os.path.join(S, 'art.js'), 'ui.js': os.path.join(S, 'ui.js')}
h = rd(os.path.join(S, 'head.html')); body = rd(os.path.join(S, 'body.html'))
for f, p in SRC.items():
    tag = '<script src="%s"></script>' % f; assert tag in body, f
    src = rd(p).replace('</script', '<\\/script')
    if f == 'data.js': src = pre + src
    body = body.replace(tag, '<script>\n' + src + '\n</script>')
out = h + body
open(os.path.join(D, 'redline-rally.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('redline-rally.html', len(out.encode('utf-8')), 'bytes;', len(have), 'pictures present')
