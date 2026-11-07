# Builds stitchwise.html (one self-contained file) and x.js (all scripts joined, for node --check). Paths are repo-relative.
import os, re, json, glob
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..')); REPO = os.path.abspath(os.path.join(SP, '..'))
S = os.path.join(D, 'src')
rd = lambda p: open(p, encoding='utf-8').read()
man = json.load(open(os.path.join(D, 'assets.json'), encoding='utf-8'))
media = os.path.join(REPO, 'games', 'stitchwise', 'media')
stems = {i['stem'] for i in man['items']}
have = sorted(s for s in (os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(media, '*.webp'))) if s in stems)
music = sorted(os.path.basename(f) for f in glob.glob(os.path.join(REPO, 'games', 'stitchwise', 'music', '*.mp3')))
pre = 'window.SW_ASSETS=' + json.dumps({'items': [{k: i[k] for k in ('stem', 'kind', 'w', 'h', 'ratio', 'alpha', 'wave')} for i in man['items']]}, separators=(',', ':')) + ';window.SW_HAVE=' + json.dumps(have) + ';window.SW_MUSIC=' + json.dumps(music) + ';\n'
sh = lambda f: os.path.join(SP, 'shell', f)
camp = 'window.CAMPAIGN = ' + json.dumps(json.load(open(os.path.join(D, 'campaign.json'), encoding='utf-8')), separators=(',', ':'), ensure_ascii=False) + ';'
SRC = {'gx-scenario.js': sh('gx-scenario.js'), 'scn.js': os.path.join(S, 'scn.js'), 'shell.js': sh('shell.js'), 'gx-kit.js': sh('gx-kit.js'), 'gx-viewport.js': sh('gx-viewport.js'), 'gx-help.js': sh('gx-help.js'), 'gx-tutor.js': sh('gx-tutor.js'),
       'gx-campaign.js': sh('gx-campaign.js'), 'campaign-data.js': None, 'gx-music.js': sh('gx-music.js'), 'gameaudio.js': os.path.join(SP, 'audio', 'gameaudio.js'), 'data.js': os.path.join(S, 'data.js'), 'engine.js': os.path.join(S, 'engine.js'), 'ai.js': os.path.join(S, 'ai.js'), 'art.js': os.path.join(S, 'art.js')}
for n in range(1, 9):
    p = os.path.join(S, 'ui%d.js' % n)
    if os.path.exists(p): SRC['ui%d.js' % n] = p
css = '\n'.join(rd(sh(f)) for f in ('shell.css', 'gx-kit.css', 'gx-help.css', 'gx-tutor.css', 'gx-campaign.css'))
h = rd(os.path.join(S, 'head.html')).replace('/*SHELL_CSS*/', css)
body = rd(os.path.join(S, 'body.html')).replace('<script src="art.js"></script>', '<script src="gameaudio.js"></script>\n<script src="art.js"></script>')
for f in re.findall(r'<script src="([^"]+)"></script>', body):
    tag = '<script src="%s"></script>' % f
    if f not in SRC: body = body.replace(tag + '\n', ''); continue
    src = camp if f == 'campaign-data.js' else rd(SRC[f])
    if f == 'data.js': src = pre + src
    body = body.replace(tag, '<script>\n' + src.replace('</script', '<\\/script') + '\n</script>')
out = h + body
open(os.path.join(D, 'stitchwise.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('stitchwise.html', len(out.encode('utf-8')), 'bytes;', len(have), 'pictures present')
